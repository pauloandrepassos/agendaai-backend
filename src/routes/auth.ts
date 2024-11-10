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
        res.status(500).json({ message: "Erro interno ao registrar usuário", error })
    }
})

authRouter.post('/verify', async (req: Request, res: Response) => {
    const { token, email } = req.body
    try {
        const user = await AuthService.verifyEmailToken(email, token)
        res.status(200).json({
            message: "Usuário verificado com sucesso",
            user
        })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: "Erro interno ao verificar usuário" })
        }
    }
})

export default authRouter
