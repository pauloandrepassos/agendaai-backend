import AppDataSource from "../database/config"
import { Address } from "../models/Address"
import { Repository } from "typeorm"

class AddressService {
    private addressRepository: Repository<Address>

    constructor() {
        this.addressRepository = AppDataSource.getRepository(Address)
    }

    // Criar um novo endereço
    public async newAddress(addressData: Partial<Address>) {
        const address = this.addressRepository.create(addressData)
        return await this.addressRepository.save(address)
    }

    // Atualizar um endereço
    public async updateAddress(id: number, updatedData: Partial<Address>) {
        const address = await this.addressRepository.findOne({ where: { id } })
        if (!address) throw new Error("Endereço não encontrado")
        Object.assign(address, updatedData)
        return await this.addressRepository.save(address)
    }

    // Deletar um endereço
    public async deleteAddress(id: number) {
        const address = await this.addressRepository.findOne({ where: { id } })
        if (!address) throw new Error("Endereço não encontrado")
        return await this.addressRepository.remove(address)
    }
}

export default new AddressService()
