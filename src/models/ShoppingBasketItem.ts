import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ShoppingBasket } from "./ShoppingBasket";
import { Product } from "./Product";

export interface IShoppingBasketItem {
    id: number;
    shopping_basket: ShoppingBasket;  // Tipo correto: a instância da entidade
    product: Product;
    quantity: number;
}

@Entity("ShoppingBasketItem")
export class ShoppingBasketItem implements IShoppingBasketItem {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => ShoppingBasket, (basket) => basket.id, { onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "shopping_basket_id" })
    shopping_basket: ShoppingBasket;  // Correção: deve ser do tipo ShoppingBasket, não um número

    @ManyToOne(() => Product, (product) => product.id, { onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "product_id" })
    product: Product;

    @Column("int")
    quantity: number;

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}
