import { EstablishmentRequest } from "../models/EstablishmentRequest";
import AppDataSource from "../database/config";
import { Repository } from "typeorm";

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
        if(!establishmentRequest) {
            return
        }     
        return establishmentRequest
    }

    public async create(establishmentRequestData: Partial<EstablishmentRequest>) {
        const establishmentRequest = this.establishmentRequest.create(establishmentRequestData)
        return await this.establishmentRequest.save(establishmentRequest)
    }
}

export default new EstablishmentRequestService()