import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Establishment } from "./Establishment";
import { User } from "./User";
import { OrderItem } from "./OrderItem";

export enum OrderStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    CANCELED = "canceled",
}

interface IOrder {
    id: number;
    order_date: Date;
    pickup_time: string
    status: OrderStatus;
    user: User;
    total_price: number;
    orderItems: OrderItem[];
    establishment: Establishment;
    created_at: Date;
    updated_at: Date;
}
@Entity("Order")
export class Order implements IOrder {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    order_date: Date;

    @Column({ type: "time", nullable: false })
    pickup_time: string;

    @Column({
        type: "enum",
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

   
    @ManyToOne(() => User, (user) => user.id, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column("decimal", { precision: 10, scale: 2,default:0 })
    total_price: number;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
    orderItems: OrderItem[];

    @ManyToOne(() => Establishment, (establishment) => establishment.id, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "establishment_id" })
    establishment: Establishment;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
