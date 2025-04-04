import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

export enum NotificationType {
    SYSTEM = "system",
    MESSAGE = "message",
    ALERT = "alert",
    TASK = "task",
    OTHER = "other"
}

interface INotification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    action_url: string | null;
    notification_type: NotificationType;
    is_read: boolean;
    created_at: Date;
}

@Entity('Notification')
export class Notification implements INotification {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    user_id: number;

    @ManyToOne(() => User, (user) => user.id, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    title: string;
    
    @Column()
    message: string;
    
    @Column({ nullable: true })
    action_url: string;
    
    @Column({
        type: "enum",
        enum: NotificationType,
        default: NotificationType.SYSTEM
    })
    notification_type: NotificationType;
    
    @Column({ default: false })
    is_read: boolean;

    @CreateDateColumn()
    created_at: Date;
}