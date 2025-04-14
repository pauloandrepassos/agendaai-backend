// src/services/notificationService.ts
import { Notification, NotificationType } from "../models/Notification";
import AppDataSource from "../database/config";
import { Order } from "../models/Order";
import { User } from "../models/User";
import CustomError from "../utils/CustomError";
import { Repository } from "typeorm";

class NotificationService {
    private notificationRepository: Repository<Notification>;
    private userRepository: Repository<User>;
    private orderRepository: Repository<Order>;

    constructor() {
        this.notificationRepository = AppDataSource.getRepository(Notification);
        this.userRepository = AppDataSource.getRepository(User);
        this.orderRepository = AppDataSource.getRepository(Order);
    }

    public async sendNewOrderNotification(orderId: number) {
        try {
            // Carrega o pedido com todos os relacionamentos necessários
            const order = await this.orderRepository.findOne({
                where: { id: orderId },
                relations: [
                    'establishment',
                    'establishment.vendor',
                    'user'
                ]
            });

            if (!order) {
                throw new CustomError("Pedido não encontrado.", 404, "ORDER_NOT_FOUND");
            }

            if (!order.establishment || !order.establishment.vendor) {
                throw new CustomError("Estabelecimento ou vendedor não encontrado.", 404, "ESTABLISHMENT_NOT_FOUND");
            }

            const notification = this.notificationRepository.create({
                user_id: order.establishment.vendor.id,
                title: "Novo Pedido Recebido",
                message: `Você recebeu um novo pedido #${order.id} no estabelecimento ${order.establishment.name}.`,
                action_url: `/orders?order=${order.id}`,
                notification_type: NotificationType.TASK,
                is_read: false
            });

            return await this.notificationRepository.save(notification);
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao enviar notificação de novo pedido.", 500, "NOTIFICATION_ERROR");
        }
    }

    public async sendOrderPickedUpNotification(order: Order) {
        try {
            const notification = this.notificationRepository.create({
                user_id: order.user.id,
                title: "Pedido Retirado",
                message: `Seu pedido #${order.id} no estabelecimento ${order.establishment.name} foi retirado com sucesso.`,
                action_url: `/order?order=${order.id}`,
                notification_type: NotificationType.SYSTEM,
                is_read: false
            });

            return await this.notificationRepository.save(notification);
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao enviar notificação de pedido retirado.", 500, "NOTIFICATION_ERROR");
        }
    }

    public async getUserNotifications(userId: number) {
        try {
            return await this.notificationRepository.find({
                where: { user_id: userId },
                order: { created_at: "DESC" }
            });
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao buscar notificações.", 500, "NOTIFICATIONS_FETCH_ERROR");
        }
    }

    public async getUnreadNotificationsCount(userId: number) {
        try {
            const count = await this.notificationRepository.count({
                where: { 
                    user_id: userId,
                    is_read: false 
                }
            });
            return count;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao contar notificações não lidas.", 500, "UNREAD_NOTIFICATIONS_COUNT_ERROR");
        }
    }

    public async markAsRead(notificationId: number, userId: number) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId, user_id: userId }
            });

            if (!notification) {
                throw new CustomError("Notificação não encontrada.", 404, "NOTIFICATION_NOT_FOUND");
            }

            notification.is_read = true;
            return await this.notificationRepository.save(notification);
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao marcar notificação como lida.", 500, "NOTIFICATION_UPDATE_ERROR");
        }
    }
}

export default new NotificationService();