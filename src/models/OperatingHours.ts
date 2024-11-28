import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Establishment } from "./Establishment"

export enum Day {
    Sunday = 'sunday',
    Monday = 'monday',
    Tuesday = 'tuesday',
    Wednesday = 'wednesday',
    Thursday = 'thursday',
    Friday = 'friday',
    Saturday = 'saturday',
}

interface IOperatingHours {
    id: number
    day_of_week: Day
    open_time: string | null
    close_time: string | null
    is_closed: boolean
    establishment_id: number
}

@Entity('OperatingHours')
export class OperatingHours implements IOperatingHours {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({
        type: "enum",
        enum: Day,
        comment: "Enum comm os dias da semana, 1 = Domingo, 7 = Sábado"
    })
    day_of_week: Day

    @Column({ type: "time", nullable: true })
    open_time: string | null
  
    @Column({ type: "time", nullable: true })
    close_time: string | null
  
    @Column({ type: "boolean", default: false })
    is_closed: boolean
  
    @Column()
    establishment_id: number

    @ManyToOne(() => Establishment, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: "establishment_id"})
    establishment: Establishment

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}