import { UserRequest } from "../types/request"
import verifyToken from "../middlewares/authorization"
import UserService from "../services/userService"
import { Router } from "express"
import { Request, Response } from 'express'
import { validateRegister } from "../validators/validadeFields"

const userRouter = Router()

userRouter.get("/users", async (req, res) => {
    try {
        const users = await UserService.getAllUsers()
        res.status(200).json(users)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao listar usuários", error})
    }
})

userRouter.get("/user", verifyToken(), async (req: UserRequest, res) => {
    try {
        const userId = req.userId
        const user = await UserService.getUserById(Number(userId))
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(404).json({ message: "Usuário não encontrado", error})
    }
})

userRouter.get("/user/:id", async (req, res) => {
    try {
        const user = await UserService.getUserById(Number(req.params.id))
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(404).json({ message: "Usuário não encontrado", error})
    }
})

userRouter.put("/user/:id", validateRegister, async (req: Request, res: Response) => {
    try {
        const allowedFields = ['name', 'phone', 'image'];
        const updatedData = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
        )
        const updatedUser = await UserService.updateUser(Number(req.params.id), updatedData)
        res.status(200).json(updatedUser)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao atualizar usuário", error})
    }
})

userRouter.delete("/users/:id", async (req, res) => {
    try {
        await UserService.deleteUser(Number(req.params.id))
        res.status(204).send()
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao deletar usuário", error})
    }
})

export default userRouter
