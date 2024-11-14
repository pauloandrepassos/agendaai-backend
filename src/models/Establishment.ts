import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from "typeorm"
import { User } from "./User"
import { Address } from "./Address"

interface IEstablishment {
    id: number
    name: string
    imageUrl: string
    cnpj: string
    vendor_id: number
    address_id: Address
}

@Entity('Establishment')
export class Establishment implements IEstablishment {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @Column({ nullable: true })
    imageUrl: string

    @Column({ unique: true })
    cnpj: string

    @ManyToOne(() => User)
    @JoinColumn({ name: 'vendor_id' })
    vendor_id: number

    @OneToOne(() => Address, { cascade: true })
    @JoinColumn()
    address_id: Address
}
