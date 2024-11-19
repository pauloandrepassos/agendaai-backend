import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { User } from "./User"

export enum RequestStatus {
    PENDING = "pending",
    APPROVED = "approved"
}

interface IEstablishmentRequest {
    id:  number
    name: string
    logo: string
    background_image: string
    cnpj: string
    zip_code: string
    state: string
    city: string
    neighborhood: string
    street: string
    number: string
    complement: string
    reference_point: string
    status: RequestStatus
    vendor_id: number
}

@Entity('EstablishmentRequest')
export class EstablishmentRequest implements IEstablishmentRequest {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string

    @Column()
    logo: string

    @Column()
    background_image: string

    @Column()
    cnpj: string

    @Column()
    zip_code: string

    @Column()
    state: string

    @Column()
    city: string

    @Column()
    neighborhood: string

    @Column()
    street: string

    @Column()
    number: string

    @Column()
    complement: string

    @Column()
    reference_point: string

    @Column({
        type: 'enum',
        enum: RequestStatus,
        default: RequestStatus.PENDING
    })
    status: RequestStatus

    @Column()
    vendor_id: number

    @OneToOne(() => User, (user) => user.id, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn({ name: 'vendor_id' })
    vendor: User; 
    
    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}