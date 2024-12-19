import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from "typeorm";
import { Establishment } from "./Establishment";
import { MenuItem } from "./MenuItem";

export interface IMenu {
    id: number;
    establishment_id: number;
    date: Date; 
    created_at: Date;
    updated_at: Date;
    menuItems?: MenuItem[]; 
}

@Entity("Menu")
export class Menu implements IMenu {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    establishment_id: number;

    @Column({ type: "date" })
    date: Date;

    @ManyToOne(() => Establishment, (establishment) => establishment.id, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "establishment_id" })
    establishment: Establishment;

    @OneToMany(() => MenuItem, (menuItem) => menuItem.menu, {
        cascade: true,
    })
    menuItems: MenuItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
