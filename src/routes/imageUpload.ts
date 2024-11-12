import cloudinaryService from '../services/cloudinaryService'
import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const imageRouter = Router()
const upload = multer({ dest: 'uploads/' })

imageRouter.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Arquivo de imagem não encontrado' })
            return
        }

        const filePath = path.resolve(req.file.path)

        const uploadResult = await cloudinaryService.uploadImage(filePath)

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Erro ao excluir o arquivo local:", err)
            } else {
                console.log("Arquivo local excluído com sucesso")
            }
        })

        res.status(200).json({ imageUrl: uploadResult })
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

export default imageRouter
