import { UserRequest } from "../types/request"
import verifyToken from "../middlewares/authorization"
import UserService from "../services/userService"
import { Router } from "express"
import { Response } from 'express'
import { validateRegister } from "../validators/validadeFields"
import multer from "multer"
import path from "path"
import fs from 'fs'
import cloudinaryService from "../services/cloudinaryService"

const upload = multer({ dest: 'uploads/' })

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

userRouter.get("/user-by-token", verifyToken(), async (req: UserRequest, res) => { //busca usuário pelo id do token
    try {
        const userId = req.userId
        console.log(`user id: ${userId}`)
        const user = await UserService.getUserById(Number(userId))
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(404).json({ message: "Usuário não encontrado", error})
    }
})

userRouter.get("/user/:id", async (req, res) => { //busca usuário pelo id fornecido na requisição
    try {
        const user = await UserService.getUserById(Number(req.params.id))
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(404).json({ message: "Usuário não encontrado", error})
    }
})

userRouter.get("/users/count", async (req, res) => {
    try {
        const count = await UserService.getUsersCount();
        res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao contar usuários", error });
    }
})

userRouter.put("/user/update-image", verifyToken(), upload.single('image'), async (req: UserRequest, res: Response) => {
    console.log("chegou na rota")
    try {
        const userId = req.userId
        console.log(`user id: ${userId}`)
        if (!req.file) {
            res.status(400).json({ error: 'Arquivo de imagem não encontrado' })
            return
        }

        const filePath = path.resolve(req.file.path)

        const uploadResult = await cloudinaryService.uploadImage(filePath)

        await UserService.updateUserImage(Number(userId), uploadResult)

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Erro ao excluir o arquivo local:", err)
            } else {
                console.log("Arquivo local excluído com sucesso")
            }
        })

        
        res.status(200).json({ message: "Imagem de usuário atualizada", imageUrl: uploadResult })
        
    } catch (error) {
        let status = 500;
        let message = "Erro ao fazer upload";

        if (error instanceof Error) {
            status = 400
            message = error.message
        }
        res.status(status).json({ message: message });
    }
})

userRouter.put("/user/update", verifyToken(), validateRegister, async (req: UserRequest, res: Response) => {
    try {
        const id = req.userId
        const { name, phone } = req.body
        const updatedUser = await UserService.updateUser(Number(id), { name, phone })
        res.status(200).json(updatedUser)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao atualizar usuário", error})
    }
})

export default userRouter