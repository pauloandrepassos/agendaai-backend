import { EstablishmentRequest, RequestStatus } from "../models/EstablishmentRequest";
import AppDataSource from "../database/config";
import { Repository } from "typeorm";
import jwt from 'jsonwebtoken'
import { sendRegistrationCompletionEmail } from "../utils/emails";
import userService from "./userService";
import establishmentService from "./establishmentService";

class EstablishmentRequestService {
    private establishmentRequest: Repository<EstablishmentRequest>

    constructor() {
        this.establishmentRequest = AppDataSource.getRepository(EstablishmentRequest)
    }

    public async getAll() {
        return await this.establishmentRequest.find();
    }

    public async getById(id: number) {
        const establishmentRequest = await this.establishmentRequest.findOne({
            where: { id },
            relations: ['vendor']
        })
        if (!establishmentRequest) {
            return
        }
        return establishmentRequest
    }

    public async getByVendorId(id: number) {
        const establishmentRequest = await this.establishmentRequest.findOne({
            where: { vendor_id: id}
        })
        if (!establishmentRequest) {
            return null
        }
        return establishmentRequest
    }

    public async create(establishmentRequestData: Partial<EstablishmentRequest>) {
        const establishmentRequest = this.establishmentRequest.create(establishmentRequestData)
        return await this.establishmentRequest.save(establishmentRequest)
    }

    public async approveRequest(id: number) {
        console.log(`ID: ${id}`)
        const establishmentRequest = await this.establishmentRequest.findOne({
            where: { id },
            relations: ['vendor']
        })

        if (!establishmentRequest) {
            throw new Error("Solicitação não encontrada")
        }

        const secretKey = process.env.SECRET_KEY

        if (!secretKey) {
            throw new Error("SECRET_KEY is not defined in environment variables")
        }

        const token = jwt.sign({ id: establishmentRequest.id, email: establishmentRequest.vendor.email }, secretKey)

        sendRegistrationCompletionEmail(establishmentRequest.vendor.email, token)

        console.log(`esse é o token: ${token}`)

        establishmentRequest.status = RequestStatus.APPROVED
        return await this.establishmentRequest.save(establishmentRequest)
    }

    public async CompleteRegistration(token: string, email: string) {
        const secretKey = process.env.SECRET_KEY
        if (!secretKey) {
            throw new Error("SECRET_KEY não está definido nas variáveis de ambiente")
        }

        const decodedToken = jwt.verify(token, secretKey) as { id: number, email: string }
        if (decodedToken.email !== email) {
            throw new Error("Token inválido ou não corresponde ao email fornecido")
        }

        const user = await userService.getUserByEmail(email)
        if (!user) {
            throw new Error("Usuário não encontrado")
        }
        const establishmentRequest = await this.establishmentRequest.findOne({
            where: { id: decodedToken.id }
        })
        if (!establishmentRequest) {
            throw new Error("Solicitação não encontrada")
        }


        const establishmentData = {
            name: establishmentRequest.name,
            logo: establishmentRequest.logo,
            background_image: establishmentRequest.background_image,
            cnpj: establishmentRequest.cnpj,
            vendor_id: establishmentRequest.vendor_id,
        }

        const addressData = {
            zip_code: establishmentRequest.zip_code,
            state: establishmentRequest.state,
            city: establishmentRequest.city,
            neighborhood: establishmentRequest.neighborhood,
            street: establishmentRequest.street,
            number: establishmentRequest.number,
            complement: establishmentRequest.complement,
            reference_point: establishmentRequest.reference_point,
        }

        const newEstablishment = await establishmentService.newEstablishment(establishmentData, addressData)

        console.log(newEstablishment)

        await this.establishmentRequest.delete(establishmentRequest.id)
        return newEstablishment
    }
}

export default new EstablishmentRequestService()