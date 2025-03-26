import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { User } from "./User"
import { Address } from "./Address"

interface IEstablishment {
    id: number
    name: string
    description: string
    logo: string
    background_image: string
    cnpj: string
    vendor_id: number
    address_id: number
    order_deadline_time: string;
    cancellation_deadline_time: string;
}

@Entity('Establishment')
export class Establishment implements IEstablishment {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @Column({ default: null})
    description: string;

    @Column({ nullable: true })
    logo: string

    @Column({ default: null})
    background_image: string

    @Column({ unique: true })
    cnpj: string
    
    @Column()
    vendor_id: number
    
    @Column()
    address_id: number

    @OneToOne(() => User, (user) => user.id, {
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn({ name: 'vendor_id' })
    vendor: User

    @OneToOne(() => Address)
    @JoinColumn({ name: 'address_id'})
    address: Address

    @Column({ type: "time", nullable: false, default: "00:00:00" })
    order_deadline_time: string

    @Column({ type: "time", nullable: false, default: "00:00:00" })
    cancellation_deadline_time: string
    
    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}
