import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product"; 

interface IOrderItem {
    id: number;
    order: Order;
    product: Product;
    quantity: number;
    price: number;
    created_at: Date;
    updated_at: Date;
}

@Entity("OrderItem")
export class OrderItem implements IOrderItem {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => Order, (order) => order.orderItems, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "order_id" })
    order: Order;

    @ManyToOne(() => Product, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "product_id" })
    product: Product;

    @Column("int")
    quantity: number;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
