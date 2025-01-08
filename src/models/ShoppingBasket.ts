import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { Establishment } from "./Establishment";
import { ShoppingBasketItem } from "./ShoppingBasketItem";
import { Menu } from "./Menu";

export interface IShoppingBasket {
    id: number;
    user: number;
    establishment: number;
    total_price: number;
    created_at: Date;
    updated_at: Date;
}

@Entity("ShoppingBasket")
export class ShoppingBasket implements IShoppingBasket {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column("decimal", { precision: 10, scale: 2 })
    total_price: number;

    @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "user_id" })
    user: number;

    @ManyToOne(() => Establishment, (establishment) => establishment.id, { onDelete: "CASCADE", nullable: false })
    @JoinColumn({name:"establishment_id"})
    establishment: number;

    @ManyToOne(() => Menu)
    @JoinColumn({ name: "menu_id" })
    menu: Menu;

    @OneToMany(() => ShoppingBasketItem, (item) => item.shopping_basket)
    shoppingBasketItems: ShoppingBasketItem[];
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
