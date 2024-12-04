import { validateRegister } from "../validators/validadeFields"
import AuthService from "../services/authService"
import { Router} from "express"
import { Request, Response } from 'express'

const authRouter = Router()

authRouter.post("/register", validateRegister, async (req: Request, res: Response) => {
    const { name, cpf, email, password, phone } = req.body
    try {

        const pendingUser = await AuthService.register(name, cpf, email, password, phone)

        res.status(201).json({
            message: "Usuário registrado",
            user: pendingUser
        })

    } catch (error) {
        let status = 500;
        let message = "Erro ao fazer login";
        if (error instanceof Error) {
            if (error.message.includes("email ou CPF já existe")) {
                status = 409;
                message = "Já existe um usuário registrado com este email ou CPF.";
            }
        }
        
        res.status(status).json({ message: message });
    }
})

authRouter.post('/verify', async (req: Request, res: Response) => {
    const { token, email } = req.body
    try {
        await AuthService.verifyEmailToken(email, token)
        res.status(200).json({
            message: "Usuário verificado com sucesso"
        })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: "Erro interno ao verificar usuário" })
        }
    }
})

authRouter.post('/login', async(req: Request, res: Response) => {
    const { email, password } = req.body
    try {
        const token = await AuthService.signIn(email, password)
        res.status(200).json({token})
    } catch (error) {
        let status = 500;
        let message = "Erro ao fazer login";

        if (error instanceof Error) {
            if (error.message === "Usuário não encontrado") {
                status = 404;
                message = error.message;
            } else if (error.message === "Email ou senha incorretos") {
                status = 401;
                message = error.message;
            }
        }
        res.status(status).json({ message: message });
    }
})

authRouter.post('/forgot-password',  async (req: Request, res: Response) => {
    const { email } = req.body
    try {
        await AuthService.sendPasswordResetEmail(email)
        res.status(200).json({ message: "Email de recuperação enviado"})
    } catch (error) {
        let status = 500
        let message = "Erro ao enviar email de recuperação"
        if(error instanceof Error) {
            if(error.message === "Usuário não encontrado") {
                status = 404
                message = error.message
            }
        }
        res.status(status).json({ message: message })
    }
})

authRouter.post('/reset-password', async (req: Request, res: Response) => {
    const { token, newPassword } = req.body
    try {
        await AuthService.resetPassword(token, newPassword)
        res.status(200).json({ message: "Senha redefinida com sucesso." })
    } catch (error) {
        let status = 500
        let message = "Erro ao redefinir a senha."
        if (error instanceof Error) {
            if (error.message === "Token expirado." || error.message === "Token inválido.") {
                status = 400
                message = error.message
            } else if (error.message === "Usuário não encontrado.") {
                status = 404
                message = error.message
            }
        }
        res.status(status).json({ message })
    }
})

export default authRouter
