import AppDataSource from "../database/config"
import { PendingUser } from "../models/PendigUser"
import { User } from "../models/User"
import { Repository } from "typeorm"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emails"

class AuthService {
    private userRepository: Repository<User>
    private pendingUserRepository: Repository<PendingUser>

    constructor() {
        this.userRepository = AppDataSource.getRepository(User)
        this.pendingUserRepository = AppDataSource.getRepository(PendingUser)
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10
        return await bcrypt.hash(password, saltRounds)
    }

    private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword)
    }

    public async register(
        name: string,
        cpf: string,
        email: string,
        password: string,
        phone: string,
    ): Promise<PendingUser | null> {

        try {

            const emailExists = await this.pendingUserRepository.findOne({ where: { email } })
            const cpfExists = await this.pendingUserRepository.findOne({ where: { cpf } })

            if (emailExists || cpfExists) {
                throw new Error("Usuário com este email ou CPF já existe")
            }

            const hashedPassword = await this.hashPassword(password)

            const pendingUser = this.pendingUserRepository.create({
                name,
                cpf,
                email,
                password: hashedPassword,
                phone,
            })

            await this.pendingUserRepository.save(pendingUser)

            const secretKey = process.env.SECRET_KEY

            if (!secretKey) {
                throw new Error("SECRET_KEY is not defined in environment variables")
            }

            const token = jwt.sign({ id: pendingUser.id }, secretKey, { expiresIn: '1h' })
            console.log(token)

            sendVerificationEmail(email, token)

            return pendingUser
        } catch (error) {
            console.error("Erro ao registrar usuário:", error)
            throw error
        }
    }

    public async verifyEmailToken(email: string, token: string): Promise<User | null> {
        const pendingUser = await this.pendingUserRepository.findOne({ where: { email } })
        if (!pendingUser) {
            throw new Error("Usuário não encontrado ou já verificado.")
        }

        const secretKey = process.env.SECRET_KEY
        if (!secretKey) {
            throw new Error("SECRET_KEY não está definido nas variáveis de ambiente")
        }

        try {
            const decodedToken = jwt.verify(token, secretKey) as { id: number }
            if (decodedToken.id !== pendingUser.id) {
                throw new Error("Token inválido para o usuário fornecido.")
            }

            const newUser = this.userRepository.create({
                name: pendingUser.name,
                cpf: pendingUser.cpf,
                email: pendingUser.email,
                password: pendingUser.password,
                phone: pendingUser.phone,
            })
            await this.userRepository.save(newUser)

            await this.pendingUserRepository.remove(pendingUser)

            return newUser
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                console.error("Token expirado:", error);
                throw new Error("Token expirado.");
            } else if (error instanceof jwt.JsonWebTokenError) {
                console.error("Token inválido:", error);
                throw new Error("Token inválido.");
            } else {
                console.error("Erro ao verificar o email:", error);
                throw new Error("Erro ao verificar o email.");
            }
        }
    }

    public async signIn(email: string, password: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            select: [
                "id",
                "password",
                "user_type"
            ]
        })

        if (!user) {
            throw new Error("Usuário não encontrado")
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            throw new Error("Email ou senha incorretos")
        }

        const secretKey = process.env.SECRET_KEY
        if (!secretKey) {
            throw new Error("SECRET_KEY não está definido nas variáveis de ambiente")
        }

        const token = jwt.sign({ id: user.id, type: user.user_type }, secretKey, { expiresIn: '12h' })
        return token
    }

    public async sendPasswordResetEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: { email }
        })
        if (!user) {
            throw new Error("Usuário não encontrado")
        }
        const secretKey = process.env.SECRET_KEY
        if (!secretKey) {
            throw new Error("SECRET_KEY não está definido nas variáveis de ambiente")
        }

        const token = jwt.sign({ email: email }, secretKey, { expiresIn: '1h' })

        await sendPasswordResetEmail(email, token)
        return
    }

    public async resetPassword(token: string, newPassword: string) {
        const secretKey = process.env.SECRET_KEY
        if (!secretKey) {
            throw new Error("SECRET_KEY não está definido nas variáveis de ambiente")
        }
        try {
            const decodedToken = jwt.verify(token, secretKey) as { email: string}
            
            const user = await this.userRepository.findOne({
                where: { email: decodedToken.email }
            })

            if(!user) {
                throw new Error("Usuário não encontrado")
            }

            const hashedPassword = await this.hashPassword(newPassword)
            user.password = hashedPassword
            await this.userRepository.save(user)

        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                console.error("Token expirado:", error);
                throw new Error("Token expirado.");
            } else if (error instanceof jwt.JsonWebTokenError) {
                console.error("Token inválido:", error);
                throw new Error("Token inválido.");
            } else {
                console.error("Erro ao verificar o email:", error);
                throw new Error("Erro ao verificar o email.");
            }
        }

    }
}

export default new AuthService()