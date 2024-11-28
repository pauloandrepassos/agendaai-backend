import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Establishment } from "./Establishment";

export interface IProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    establishment_id: number;
    created_at: Date;
    updated_at: Date;
}

@Entity("Product")
export class Product implements IProduct {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;

    @Column()
    establishment_id: number;

    @ManyToOne(() => Establishment, (establishment) => establishment.id, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "establishment_id" })
    establishment: Establishment;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
