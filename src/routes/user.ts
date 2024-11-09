import UserService from "../services/userService";
import { Router } from "express";

const userRouter = Router();

// Rota para criar um novo usuário
userRouter.post("/users", async (req, res) => {
    try {
        const userData = req.body;
        const newUser = await UserService.newUser(userData);
        res.status(201).json(newUser); // Retorna o novo usuário criado
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar usuário", error});
    }
});

// Rota para listar todos os usuários
userRouter.get("/users", async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json(users); // Retorna todos os usuários
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar usuários", error});
    }
});

// Rota para buscar um usuário por ID
userRouter.get("/users/:id", async (req, res) => {
    try {
        const user = await UserService.getUserById(Number(req.params.id));
        res.status(200).json(user); // Retorna o usuário encontrado
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: "Usuário não encontrado", error});
    }
});

// Rota para atualizar um usuário
userRouter.put("/users/:id", async (req, res) => {
    try {
        const updatedData = req.body;
        const updatedUser = await UserService.updateUser(Number(req.params.id), updatedData);
        res.status(200).json(updatedUser); // Retorna o usuário atualizado
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar usuário", error});
    }
});

// Rota para deletar um usuário
userRouter.delete("/users/:id", async (req, res) => {
    try {
        await UserService.deleteUser(Number(req.params.id));
        res.status(204).send(); // Retorna 204 sem conteúdo, pois o usuário foi deletado
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar usuário", error});
    }
});

export default userRouter;
