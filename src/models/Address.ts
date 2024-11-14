import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

interface IAddress {
    id: number
    zip_code: string
    state: string
    city: string
    neighborhood: string
    street: string
    number: string
    complement?: string
    reference_point?: string
}

@Entity('Address')
export class Address implements IAddress {
    @PrimaryGeneratedColumn('increment')
    id: number

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

    @Column({ nullable: true })
    complement: string

    @Column({ nullable: true })
    reference_point: string
    
    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}
