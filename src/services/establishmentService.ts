import AppDataSource from "../database/config"
import { Establishment } from "../models/Establishment"
import { Repository } from "typeorm"

class EstablishmentService {
    private establishmentRepository: Repository<Establishment>

    constructor() {
        this.establishmentRepository = AppDataSource.getRepository(Establishment)
    }

    // Criar um novo estabelecimento
    public async newEstablishment(establishmentData: Partial<Establishment>) {
        const establishment = this.establishmentRepository.create(establishmentData)
        return await this.establishmentRepository.save(establishment)
    }

    // Listar todos os estabelecimentos
    public async getAllEstablishments() {
        return await this.establishmentRepository.find({relations:['address_id']})
    }

    // Obter um estabelecimento por ID
    public async getEstablishmentById(id: number) {
        const establishment = await this.establishmentRepository.findOne({ where: { id },relations:['address_id'] })
        if (!establishment) throw new Error("Estabelecimento não encontrado")
        return establishment
    }

    // Atualizar um estabelecimento
    public async updateEstablishment(id: number, updatedData: Partial<Establishment>) {
        const establishment = await this.getEstablishmentById(id)
        Object.assign(establishment, updatedData)
        return await this.establishmentRepository.save(establishment)
    }

    // Deletar um estabelecimento
    public async deleteEstablishment(id: number) {
        const establishment = await this.getEstablishmentById(id)
        return await this.establishmentRepository.remove(establishment)
    }
}

export default new EstablishmentService()
