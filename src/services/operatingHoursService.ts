import AppDataSource from "../database/config"
import { Day, OperatingHours } from "../models/OperatingHours"
import { Repository } from "typeorm"

class OperatingHoursService {
    private operatingHoursRepository: Repository<OperatingHours>

    constructor() {
        this.operatingHoursRepository = AppDataSource.getRepository(OperatingHours)
    }

    public async create(data: Partial<OperatingHours>): Promise<OperatingHours> {
        await this.validateOperatingHoursConflict(data)

        const newOperatingHours = this.operatingHoursRepository.create(data)
        return await this.operatingHoursRepository.save(newOperatingHours)
    }

    public async getAll(): Promise<OperatingHours[]> {
        return await this.operatingHoursRepository.find({
            relations: ["establishment"],
        });
    }

    public async getById(id: number): Promise<OperatingHours | null> {
        return await this.operatingHoursRepository.findOne({
            where: { id },
            relations: ["establishment"],
        });
    }

    public async getByEstablishmentId(establishmentId: number): Promise<OperatingHours[]> {
        return await this.operatingHoursRepository.find({
            where: { establishment_id: establishmentId },
        });
    }

    public async update(id: number, data: Partial<OperatingHours>): Promise<OperatingHours> {
        const operatingHours = await this.getById(id);
        if (!operatingHours) {
            throw new Error("Horário de funcionamento não encontrado");
        }
        Object.assign(operatingHours, data);
        return await this.operatingHoursRepository.save(operatingHours);
    }

    public async delete(id: number): Promise<void> {
        const operatingHours = await this.getById(id);
        if (!operatingHours) {
            throw new Error("Horário de funcionamento não encontrado");
        }
        await this.operatingHoursRepository.remove(operatingHours);
    }

    private async validateOperatingHoursConflict(
        data: Partial<OperatingHours>
    ): Promise<void> {
        if (!data.establishment_id || !data.day_of_week) {
            throw new Error("Estabelecimento e dia da semana são obrigatórios");
        }
    
        const existingHours = await this.operatingHoursRepository.find({
            where: {
                establishment_id: data.establishment_id,
                day_of_week: data.day_of_week,
            },
        });
    
        const conflictingHours = existingHours.filter((existing) => {
            if (existing.is_closed || data.is_closed) {
                return true
            }
            if (
                existing.open_time &&
                existing.close_time &&
                data.open_time &&
                data.close_time
            ) {
                const existingOpen = new Date(`1970-01-01T${existing.open_time}Z`)
                const existingClose = new Date(`1970-01-01T${existing.close_time}Z`)
                const newOpen = new Date(`1970-01-01T${data.open_time}Z`)
                const newClose = new Date(`1970-01-01T${data.close_time}Z`)
    
                return (
                    (newOpen >= existingOpen && newOpen <= existingClose) || 
                    (newClose >= existingOpen && newClose <= existingClose) || 
                    (newOpen <= existingOpen && newClose >= existingClose)  
                )
            }
            return false
        })
    
        if (conflictingHours.length > 0) {
            const conflictMessages = conflictingHours.map((conflict) => {
                const dayName = Object.keys(Day).find(
                    (key) => Day[key as keyof typeof Day] === conflict.day_of_week
                ) 
                return `Dia: ${dayName}, Horário: ${conflict.open_time} - ${conflict.close_time}`
            })
    
            throw new Error(
                `Conflito de horário detectado: ${conflictMessages.join("; ")}`
            );
        }
    }
    

}

export default new OperatingHoursService()