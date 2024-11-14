import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

export enum UserType {
    CLIENT = "client",
    VENDOR = "vendor",
    ADMIN = "admin",
}

interface IUser {
    id: number
    name: string
    cpf: string
    email: string
    password: string
    phone: string
    image: string
    user_type: UserType
}

@Entity('User')
export class User implements IUser {
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
    
    @Column({nullable: true})
    image: string
    
    @Column({
        type: "enum",
        enum: UserType,
        default: UserType.CLIENT
    })
    user_type: UserType

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}