import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Establishment } from "./Establishment";

export enum CategoryProduct {
    SAVORY = "savoury",     //"salgado"
    SWEET = "sweet",        //"doce"
    CAKE = "cake",          //"bolo"
    PIE = "pie",            //"torta"
    DRINK = "drink",        //"bebida"
    MEAL = "meal",          //"marmita"
    BREAKFAST = "breakfast",//"café da manha"
    OTHERS = "others"       // outros      
}

export interface IProduct {
    id: number;
    name: string;
    image: string
    description: string;
    price: number;
    category: CategoryProduct
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
    image: string

    @Column()
    description: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;

    @Column({
        type: "enum",
        enum: CategoryProduct,
        default: CategoryProduct.OTHERS
    })
    category: CategoryProduct;

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
