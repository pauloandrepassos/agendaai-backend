import { Address } from "../models/Address";
import AppDataSource from "../database/config";
import { Establishment } from "../models/Establishment";
import { Repository } from "typeorm";
import addressService from "./addressService";
import CustomError from "../utils/CustomError";

class EstablishmentService {
    private establishmentRepository: Repository<Establishment>;
    private addressRepository: Repository<Address>;

    constructor() {
        this.establishmentRepository = AppDataSource.getRepository(Establishment);
        this.addressRepository = AppDataSource.getRepository(Address);
    }

    public async newEstablishment(establishmentData: Partial<Establishment>, addressData: Partial<Address>) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const newAddress = await addressService.createAddress(addressData, queryRunner);

            const establishment = this.establishmentRepository.create({
                ...establishmentData,
                address: newAddress,
            });
            const newEstablishment = await queryRunner.manager.save(establishment);

            await queryRunner.commitTransaction();
            return newEstablishment;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao criar estabelecimento e endereço.", 500, "CREATE_ESTABLISHMENT_ERROR");
        } finally {
            await queryRunner.release();
        }
    }

    public async getAllEstablishments() {
        try {
            const establishments = await this.establishmentRepository.find({
                relations: ['address', 'vendor'],
            });

            if (!establishments.length) {
                throw new CustomError("Nenhum estabelecimento encontrado.", 404, "NO_ESTABLISHMENTS_FOUND");
            }

            return establishments;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao listar estabelecimentos.", 500, "GET_ALL_ESTABLISHMENTS_ERROR");
        }
    }

    public async getEstablishmentById(id: number) {
        try {
            const establishment = await this.establishmentRepository.findOne({ where: { id }, relations: ['address'] });

            if (!establishment) {
                throw new CustomError("Estabelecimento não encontrado.", 404, "ESTABLISHMENT_NOT_FOUND");
            }

            return establishment;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao buscar estabelecimento por ID.", 500, "GET_ESTABLISHMENT_BY_ID_ERROR");
        }
    }

    public async getEstablishmentByVendorId(vendorId: number) {
        try {
            const establishment = await this.establishmentRepository.findOne({
                where: { vendor: { id: vendorId } },
                relations: ['address'],
            });

            if (!establishment) {
                throw new CustomError("Estabelecimento não encontrado para o vendedor especificado.", 404, "ESTABLISHMENT_NOT_FOUND_FOR_VENDOR");
            }

            return establishment;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao buscar estabelecimento pelo ID do vendedor.", 500, "GET_ESTABLISHMENT_BY_VENDOR_ID_ERROR");
        }
    }

    public async updateEstablishment(id: number, updatedEstablishmentData: Partial<Establishment>, updatedAddressData: Partial<Address>) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const establishment = await this.getEstablishmentById(id);

            Object.assign(establishment, updatedEstablishmentData);

            if (establishment.address) {
                Object.assign(establishment.address, updatedAddressData);
                await queryRunner.manager.save(establishment.address);
            } else {
                const address = this.addressRepository.create(updatedAddressData);
                await this.addressRepository.save(address);
            }

            const updatedEstablishment = await queryRunner.manager.save(establishment);

            await queryRunner.commitTransaction();
            return updatedEstablishment;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao atualizar estabelecimento e endereço.", 500, "UPDATE_ESTABLISHMENT_ERROR");
        } finally {
            await queryRunner.release();
        }
    }

    public async deleteEstablishment(id: number) {
        try {
            const establishment = await this.getEstablishmentById(id);
            await this.establishmentRepository.remove(establishment);
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao deletar estabelecimento.", 500, "DELETE_ESTABLISHMENT_ERROR");
        }
    }

    public async getEstablishmentCount(): Promise<number> {
        try {
            const count = await this.establishmentRepository.count();
            return count;
        } catch (error) {
            console.error("Erro ao contar estabelecimntos:", error);
            throw new CustomError("Erro ao contar estabelecimntos.", 500, "COUNT_USERS_ERROR");
        }
    }
}

export default new EstablishmentService();
