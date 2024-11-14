import { Address } from "../models/Address"
import AppDataSource from "../database/config"
import { Establishment } from "../models/Establishment"
import { Repository } from "typeorm"
import addressService from "./addressService"

class EstablishmentService {
    private establishmentRepository: Repository<Establishment>
    private addressRepository: Repository<Address>

    constructor() {
        this.establishmentRepository = AppDataSource.getRepository(Establishment)
        this.addressRepository = AppDataSource.getRepository(Address)
    }

    public async newEstablishment(establishmentData: Partial<Establishment>, addressData: Partial<Address>) {
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()

        try {
            const newAddress = await addressService.createAddress(addressData, queryRunner)

            const establishment = this.establishmentRepository.create({
                ...establishmentData,
                address: newAddress,
            })
            const newEstablishment = await queryRunner.manager.save(establishment)

            await queryRunner.commitTransaction()
            return newEstablishment

        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw new Error("Erro ao criar estabelecimento e endereço: " + error)
        } finally {
            await queryRunner.release()
        }
    }

    public async getAllEstablishments() {
        return await this.establishmentRepository.find({ relations: ['address'] })
    }

    public async getEstablishmentById(id: number) {
        const establishment = await this.establishmentRepository.findOne({ where: { id }, relations: ['address'] })
        if (!establishment) throw new Error("Estabelecimento não encontrado")
        return establishment
    }

    public async updateEstablishment(id: number, updatedEstablishmentData: Partial<Establishment>, updatedAddressData: Partial<Address>) {
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()

        try {
            const establishment = await this.getEstablishmentById(id)
            if (!establishment) throw new Error("Estabelecimento não encontrado")

            // Atualiza dados do estabelecimento
            Object.assign(establishment, updatedEstablishmentData)

            // Atualiza dados do endereço
            if (establishment.address) {
                Object.assign(establishment.address, updatedAddressData)
                await queryRunner.manager.save(establishment.address)
            } else {
                const address = this.addressRepository.create(updatedAddressData)
                await this.addressRepository.save(address)
            }

            // Salva as alterações do estabelecimento
            const updatedEstablishment = await queryRunner.manager.save(establishment)

            await queryRunner.commitTransaction()
            return updatedEstablishment

        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw new Error("Erro ao atualizar estabelecimento e endereço: " + error)
        } finally {
            await queryRunner.release()
        }
    }

    public async deleteEstablishment(id: number) {
        const establishment = await this.getEstablishmentById(id)
        return await this.establishmentRepository.remove(establishment)
    }
}

export default new EstablishmentService()
