import { Repository } from "typeorm";
import AppDataSource from "../database/config"
import { OperatingHours } from "../models/OperatingHours"
import establishmentService from "./establishmentService";

class OperatingHoursService {
    private operatingHoursRepository: Repository<OperatingHours>

    constructor() {
        this.operatingHoursRepository = AppDataSource.getRepository(OperatingHours)
    }

    async getByEstablishment(establishment_id: number) {
        return this.operatingHoursRepository.find({ where: { establishment_id } });
    }

    async getByVendorId(vendor_id: number) {
        const establishment = await establishmentService.getEstablishmentByVendorId(vendor_id)
        return this.operatingHoursRepository.find({ where: { establishment_id: (await establishment).id } });
    }

    async saveOperatingHours(establishment_id: number, hours: Partial<OperatingHours>[]) {
        await this.operatingHoursRepository.delete({ establishment_id });
        const newHours = hours.map(hour => ({ ...hour, establishment_id }));
        return this.operatingHoursRepository.save(newHours);
    }
}

export default new OperatingHoursService()