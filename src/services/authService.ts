import AppDataSource from "../database/config";
import { PendingUser } from "../models/PendigUser";
import { User } from "../models/User";
import { Repository } from "typeorm";
import bcrypt from 'bcrypt'
import UserValidator from "../validators/UserValidator";
import jwt from 'jsonwebtoken'
import { sendVerificationEmail } from "../utils/emails";

class AuthService {
    private userRepository: Repository<User>
    private pendingUserRepository: Repository<PendingUser>

    constructor() {
        this.userRepository = AppDataSource.getRepository(User)
        this.pendingUserRepository = AppDataSource.getRepository(PendingUser)
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    public async register(
        name: string,
        cpf: string,
        email: string,
        password: string,
        phone: string,
    ): Promise<PendingUser | null> {

        try {
            UserValidator.validateRegisterFields(name, cpf, email, password, phone);

            const emailExists = await this.pendingUserRepository.findOne({ where: { email } });
            const cpfExists = await this.pendingUserRepository.findOne({ where: { cpf } });

            if (emailExists || cpfExists) {
                throw new Error("Usuário com este email ou CPF já existe.");
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
                throw new Error("SECRET_KEY is not defined in environment variables");
            }

            const token = jwt.sign({ id: pendingUser.id }, secretKey, { expiresIn: '1h' })
            console.log(token)

            sendVerificationEmail(email, token)

            return pendingUser;
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            throw error
        }
    }
}

export default new AuthService()