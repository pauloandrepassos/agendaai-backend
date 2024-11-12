import cloudinary from '../config/cloudinary'
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

class CloudinaryService {
    public async uploadImage(imagePath: string): Promise<string> {
        try {
            const result: UploadApiResponse = await cloudinary.uploader.upload(imagePath, {
                folder: 'uploads',
            })

            return result.secure_url
        } catch (error) {
            throw new Error(`Erro ao fazer upload para o Cloudinary: ${(error as UploadApiErrorResponse).message}`)
        }
    }
}

export default new CloudinaryService()
