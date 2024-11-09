import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

interface IPendingUser {
    id: number
    name: string
    cpf: string
    email: string
    password: string
    phone: string
}

@Entity('PendingUser')
export class PendingUser implements IPendingUser {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string
    
    @Column({unique: true})
    cpf: string
    
    @Column({unique: true})
    email: string
    
    @Column()
    password: string
    
    @Column()
    phone: string
}