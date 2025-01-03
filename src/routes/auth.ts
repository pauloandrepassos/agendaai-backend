import { validateRegister } from "../validators/validadeFields";
import AuthService from "../services/authService";
import { Router } from "express";
import { Request, Response } from "express";
import CustomError from "../utils/CustomError";

const authRouter = Router();

authRouter.post("/register", validateRegister, async (req: Request, res: Response) => {
    const { name, cpf, email, password, phone } = req.body;
    try {
        const pendingUser = await AuthService.register(name, cpf, email, password, phone);
        res.status(201).json({
            message: "Usuário registrado",
            user: pendingUser,
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                message: error.message,
                code: error.errorCode,
                details: error.details,
            });
        } else {
            res.status(500).json({ message: "Erro ao registrar usuário." });
        }
    }
});

authRouter.post("/verify", async (req: Request, res: Response) => {
    const { token, email } = req.body;
    try {
        await AuthService.verifyEmailToken(email, token);
        res.status(200).json({
            message: "Usuário verificado com sucesso",
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                message: error.message,
                code: error.errorCode,
                details: error.details,
            });
        } else {
            res.status(500).json({ message: "Erro interno ao verificar usuário." });
        }
    }
});

authRouter.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const token = await AuthService.signIn(email, password);
        res.status(200).json({ token });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                message: error.message,
                code: error.errorCode,
                details: error.details,
            });
        } else {
            res.status(500).json({ message: "Erro ao fazer login." });
        }
    }
});

authRouter.post("/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        await AuthService.sendPasswordResetEmail(email);
        res.status(200).json({ message: "Email de recuperação enviado" });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                message: error.message,
                code: error.errorCode,
                details: error.details,
            });
        } else {
            res.status(500).json({ message: "Erro ao enviar email de recuperação." });
        }
    }
});

authRouter.post("/reset-password", async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    try {
        await AuthService.resetPassword(token, newPassword);
        res.status(200).json({ message: "Senha redefinida com sucesso." });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                message: error.message,
                code: error.errorCode,
                details: error.details,
            });
        } else {
            res.status(500).json({ message: "Erro ao redefinir a senha." });
        }
    }
});

export default authRouter;
