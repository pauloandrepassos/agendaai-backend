import AppDataSource from "../database/config";
import { PendingUser } from "../models/PendigUser";
import { User } from "../models/User";
import { Repository } from "typeorm";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emails";
import CustomError from "../utils/CustomError";

class AuthService {
    private userRepository: Repository<User>;
    private pendingUserRepository: Repository<PendingUser>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.pendingUserRepository = AppDataSource.getRepository(PendingUser);
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    public async register(name: string, cpf: string, email: string, password: string, phone: string): Promise<PendingUser | null> {
        try {
            const hasPendingUser = await this.pendingUserRepository.findOne({ where: { email } });
            if (hasPendingUser) {
                await this.pendingUserRepository.remove(hasPendingUser);
            }

            const emailExists = await this.userRepository.findOne({ where: { email } });
            const cpfExists = await this.userRepository.findOne({ where: { cpf } });

            if (emailExists || cpfExists) {
                throw new CustomError("Usuário com este email ou CPF já existe.", 409, "USER_ALREADY_EXISTS");
            }

            const hashedPassword = await this.hashPassword(password);

            const pendingUser = this.pendingUserRepository.create({
                name,
                cpf,
                email,
                password: hashedPassword,
                phone,
            });

            await this.pendingUserRepository.save(pendingUser);

            const secretKey = process.env.SECRET_KEY;

            if (!secretKey) {
                throw new CustomError("SECRET_KEY não está definido nas variáveis de ambiente.", 500, "SECRET_KEY_UNDEFINED");
            }

            const token = jwt.sign({ id: pendingUser.id }, secretKey, { expiresIn: '1h' });
            sendVerificationEmail(email, token);

            return pendingUser;
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            throw error;
        }
    }

    public async verifyEmailToken(email: string, token: string): Promise<User | null> {
        const pendingUser = await this.pendingUserRepository.findOne({ where: { email } });
        if (!pendingUser) {
            throw new CustomError("Usuário não encontrado ou já verificado.", 404, "USER_NOT_FOUND");
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new CustomError("SECRET_KEY não está definido nas variáveis de ambiente.", 500, "SECRET_KEY_UNDEFINED");
        }

        try {
            const decodedToken = jwt.verify(token, secretKey) as { id: number };
            if (decodedToken.id !== pendingUser.id) {
                throw new CustomError("Token inválido para o usuário fornecido.", 400, "INVALID_TOKEN");
            }

            const existingUser = await this.userRepository.findOne({ where: { email } });
            if (existingUser) {
                throw new CustomError("Já existe um usuário registrado com este email.", 409, "USER_ALREADY_EXISTS");
            }

            const newUser = this.userRepository.create({
                name: pendingUser.name,
                cpf: pendingUser.cpf,
                email: pendingUser.email,
                password: pendingUser.password,
                phone: pendingUser.phone,
            });

            await this.userRepository.save(newUser);
            await this.pendingUserRepository.remove(pendingUser);

            return newUser;
        } catch (error) {
            if(error instanceof CustomError) throw error
            else if (error instanceof jwt.TokenExpiredError) {
                throw new CustomError("Token expirado.", 400, "TOKEN_EXPIRED");
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new CustomError("Token inválido.", 400, "INVALID_TOKEN");
            } else {
                console.error("Erro ao verificar o email:", error);
                throw new CustomError("Erro ao verificar o email.", 500, "EMAIL_VERIFICATION_ERROR");
            }
        }
    }

    public async signIn(email: string, password: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            select: ["id", "password", "user_type"]
        });

        if (!user) {
            throw new CustomError("Usuário não encontrado.", 404, "USER_NOT_FOUND");
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new CustomError("Email ou senha incorretos.", 401, "INVALID_CREDENTIALS");
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new CustomError("SECRET_KEY não está definido nas variáveis de ambiente.", 500, "SECRET_KEY_UNDEFINED");
        }

        const token = jwt.sign({ id: user.id, type: user.user_type }, secretKey, { expiresIn: '12h' });
        return token;
    }

    public async sendPasswordResetEmail(email: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new CustomError("Usuário não encontrado.", 404, "USER_NOT_FOUND");
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new CustomError("SECRET_KEY não está definido nas variáveis de ambiente.", 500, "SECRET_KEY_UNDEFINED");
        }

        const token = jwt.sign({ email: email }, secretKey, { expiresIn: '1h' });
        await sendPasswordResetEmail(email, token);
    }

    public async resetPassword(token: string, newPassword: string) {
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new CustomError("SECRET_KEY não está definido nas variáveis de ambiente.", 500, "SECRET_KEY_UNDEFINED");
        }

        try {
            const decodedToken = jwt.verify(token, secretKey) as { email: string };

            const user = await this.userRepository.findOne({ where: { email: decodedToken.email } });

            if (!user) {
                throw new CustomError("Usuário não encontrado.", 404, "USER_NOT_FOUND");
            }

            const hashedPassword = await this.hashPassword(newPassword);
            user.password = hashedPassword;
            await this.userRepository.save(user);

        } catch (error) {
            if(error instanceof CustomError) throw error
            else if (error instanceof jwt.TokenExpiredError) {
                throw new CustomError("Token expirado.", 400, "TOKEN_EXPIRED");
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new CustomError("Token inválido.", 400, "INVALID_TOKEN");
            } else {
                throw new CustomError("Erro ao redefinir a senha.", 500, "PASSWORD_RESET_ERROR");
            }
        }
    }
}

export default new AuthService();
