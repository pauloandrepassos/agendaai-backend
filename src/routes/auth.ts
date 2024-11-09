import AuthService from "../services/authService";
import { Router } from "express";

const authRouter = Router();

authRouter.get("/register", async (req, res) => {
    try {
        res.status(200).json({message: "Rota acessada com sucesso"})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao acessar rota", error});
    }
})

authRouter.post("/register", async (req, res) => {
    const { name, cpf, email, password, phone } = req.body;
    try {
        const pendingUser = await AuthService.register(name, cpf, email, password, phone)
        res.status(201).json({
            message: "Usuário registrado",
            user: pendingUser
        })
        
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({
                message: "Erro ao registrar usuário",
                error: error.message
            });
        } else {
            res.status(400).json({
                message: "Erro desconhecido",
                error: String(error)
            });
        }
        
    }

})

export default authRouter;
