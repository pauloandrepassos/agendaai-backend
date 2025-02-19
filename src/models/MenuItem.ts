import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,ManyToOne,JoinColumn
} from "typeorm";
import { Menu } from "./Menu";
import { Product } from "./Product";

export interface IMenuItem {
    id: number;
    menu_id: number;
    product_id: number;
    max_quantity: number;
    created_at: Date;
    updated_at: Date;
}

@Entity("MenuItem")
export class MenuItem implements IMenuItem {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    menu_id: number;

    @Column()
    product_id: number;

    @Column({ nullable: true })
    max_quantity: number;

    @ManyToOne(() => Menu, (menu) => menu.id, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "menu_id" })
    menu: Menu;

    @ManyToOne(() => Product, (product) => product.id, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "product_id" })
    product: Product;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
