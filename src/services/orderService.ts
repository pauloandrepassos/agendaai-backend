import { Between, FindOptionsWhere, Repository } from "typeorm";
import AppDataSource from "../database/config";
import { ShoppingBasket } from "../models/ShoppingBasket";
import { ShoppingBasketItem } from "../models/ShoppingBasketItem";
import { Order, OrderStatus } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { User } from "../models/User";
import { Establishment } from "../models/Establishment";
import CustomError from "../utils/CustomError";
import establishmentService from "./establishmentService";
import notificationService from "./notificationService";

class OrderService {
    private orderRepository: Repository<Order>;
    private shoppingBasketRepository: Repository<ShoppingBasket>;
    private userRepository: Repository<User>;
    private establishmentRepository: Repository<Establishment>;

    constructor() {
        this.orderRepository = AppDataSource.getRepository(Order);
        this.shoppingBasketRepository = AppDataSource.getRepository(ShoppingBasket);
        this.userRepository = AppDataSource.getRepository(User);
        this.establishmentRepository = AppDataSource.getRepository(Establishment);
    }

    public async createOrderFromBasket(userId: number, establishmentId: number, pickupTime: string) {
        // Verifica se o usuário tem um pedido pendente
        const hasPendingOrder = await this.hasPendingOrder(userId);
        if (hasPendingOrder) {
            throw new CustomError("Você já possui um pedido em andamento. Você só poderá adicionar um novo pedido, após a finalização do pedido atual.", 400, "PENDING_ORDER_EXISTS");
        }
    
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
    
        try {
            const basket = await this.shoppingBasketRepository.findOne({
                where: { user_id: userId },
                relations: ["shoppingBasketItems", "shoppingBasketItems.product", "establishment"],
            });
            if (!basket || !basket.shoppingBasketItems.length) {
                throw new CustomError("Cesto de compras vazio ou não encontrado.", 400, "BASKET_NOT_FOUND");
            }
    
            const totalPrice = basket.shoppingBasketItems.reduce(
                (total, item) => total + item.product.price * item.quantity,
                0
            );
    
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new CustomError("Usuário não encontrado.", 404, "USER_NOT_FOUND");
            }
    
            const establishment = await this.establishmentRepository.findOne({
                where: { id: establishmentId },
            });
            if (!establishment) {
                throw new CustomError("Estabelecimento não encontrado.", 404, "ESTABLISHMENT_NOT_FOUND");
            }
    
            const order = this.orderRepository.create({
                user: { id: user.id },
                establishment: { id: establishment.id },
                total_price: totalPrice,
                order_date: basket.order_date,
                status: OrderStatus.PENDING,
                pickup_time: pickupTime,
            });
    
            const savedOrder = await queryRunner.manager.save(order);
    
            for (const item of basket.shoppingBasketItems) {
                const orderItem = queryRunner.manager.create(OrderItem, {
                    order: savedOrder,
                    product: item.product,
                    quantity: item.quantity,
                    price: item.product.price,
                });
                await queryRunner.manager.save(orderItem);
            }
    
            await queryRunner.manager.delete(ShoppingBasketItem, { shopping_basket: { id: basket.id } });
            await queryRunner.manager.delete(ShoppingBasket, { id: basket.id });
    
            await queryRunner.commitTransaction();

            await notificationService.sendNewOrderNotification(savedOrder.id);

            return savedOrder;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao criar pedido.", 500, "ORDER_CREATION_ERROR");
        } finally {
            await queryRunner.release();
        }
    }

    public async getOrdersByUserId(userId: number) {
        try {
            return await this.orderRepository.find({
                where: { user: { id: userId } },
                relations: ["establishment", "orderItems", "orderItems.product"],
            });
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao buscar pedidos do usuário.", 500, "USER_ORDERS_FETCH_ERROR");
        }
    }

    public async getOrderById(orderId: number) {
        try {
            const order = await this.orderRepository.findOne({
                where: { id: orderId },
                relations: ["establishment", "user", "orderItems", "orderItems.product"],
            });
            if (!order) throw new CustomError("Pedido não encontrado.", 404, "ORDER_NOT_FOUND");
            return order;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao buscar pedido.", 500, "ORDER_FETCH_ERROR");
        }
    }

    public async getOrdersByVendorId(vendorId: number, date?: string) {
        try {
            const establishment = await establishmentService.getEstablishmentByVendorId(vendorId);

            const whereCondition: FindOptionsWhere<Order> = { establishment: { id: establishment.id } };
            if (date) {
                const startOfDay = new Date(`${date}T00:00:00`);
                const endOfDay = new Date(`${date}T23:59:59.999`);

                console.log("startOfDay", startOfDay);
                console.log("endOfDay", endOfDay);

                whereCondition.order_date = Between(startOfDay, endOfDay);
            }

            const orders = await this.orderRepository.find({
                where: whereCondition,
                relations: ["user", "orderItems", "orderItems.product"],
            });

            return orders;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao buscar pedido.", 500, "ORDER_FETCH_ERROR");

        }
    }

    public async getOrdersByEstablishmentId(establishmentId: number) {
        try {
            const orders = await this.orderRepository.find({
                where: { establishment: { id: establishmentId } },
                relations: ["user", "orderItems", "orderItems.product"],
            });

            if (!orders.length) {
                throw new CustomError("Nenhum pedido encontrado para o estabelecimento informado.", 404, "ESTABLISHMENT_ORDERS_NOT_FOUND");
            }

            return orders;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao buscar pedidos do estabelecimento.", 500, "ESTABLISHMENT_ORDERS_FETCH_ERROR");
        }
    }

    public async confirmOrderPickup(orderId: number) {
        try {
            const order = await this.getOrderById(orderId);
            if (!order) throw new CustomError("Pedido não encontrado.", 404, "ORDER_NOT_FOUND");

            order.status = OrderStatus.COMPLETED;
            const updatedOrder = await this.orderRepository.save(order);
            
            // Envia notificação para o cliente
            await notificationService.sendOrderPickedUpNotification(updatedOrder);

            return updatedOrder;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao confirmar retirada do pedido.", 500, "ORDER_PICKUP_CONFIRMATION_ERROR");
        }
    }

    public async getOrderDatesByEstablishmentId(vendorId: number) {
        try {
            const establishment = await this.establishmentRepository.findOne({
                where: { vendor: { id: vendorId } },
                relations: ['address'],
            });
            const establishmentId = await establishment?.id
            const orders = await this.orderRepository
                .createQueryBuilder("order")
                .select("DISTINCT DATE(order.order_date)", "order_date")
                .where("order.establishment_id = :establishmentId", { establishmentId })
                .getRawMany();

            const formattedDates = orders.map(order => {
                const date = new Date(order.order_date);
                return date.toISOString().split("T")[0]; // Extrai apenas a parte da data
            });

            console.log(`Total de pedidos: ${orders.length}`);
            console.log(`Datas formatadas: ${formattedDates}`);

            return formattedDates;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao buscar datas dos pedidos.", 500, "ORDER_DATES_FETCH_ERROR");
        }
    }

    public async getOrdersCount(): Promise<number> {
        try {
            const count = await this.orderRepository.count();
            return count;
        } catch (error) {
            console.error("Erro ao contar pedidos:", error);
            throw new CustomError("Erro ao contar pedidos.", 500, "COUNT_USERS_ERROR");
        }
    }

    public async hasPendingOrder(userId: number): Promise<boolean> {
        const pendingOrder = await this.orderRepository.findOne({
            where: {
                user: { id: userId },
                status: OrderStatus.PENDING,
            },
        });

        return !!pendingOrder;
    }

    public async cancelOrder(userId: number, orderId: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
    
        try {
            const order = await this.orderRepository.findOne({
                where: { id: orderId, user: { id: userId } },
                relations: ["establishment"]
            });
    
            if (!order) {
                throw new CustomError("Pedido não encontrado ou não pertence ao usuário.", 404, "ORDER_NOT_FOUND");
            }
    
            if (order.status !== OrderStatus.PENDING) {
                throw new CustomError("Só é possível cancelar pedidos com status 'pending'.", 400, "INVALID_ORDER_STATUS");
            }
    
            // Verifica o prazo de cancelamento
            const canCancel = this.checkCancellationDeadline(order);
            if (!canCancel) {
                throw new CustomError("O prazo para cancelamento deste pedido já expirou.", 400, "CANCELLATION_DEADLINE_EXPIRED");
            }
    
            // Atualiza o status do pedido
            order.status = OrderStatus.CANCELED;
            const updatedOrder = await queryRunner.manager.save(order);
    
            await queryRunner.commitTransaction();
            return updatedOrder;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao cancelar pedido.", 500, "ORDER_CANCELLATION_ERROR");
        } finally {
            await queryRunner.release();
        }
    }
    
    private checkCancellationDeadline(order: Order): boolean {
        // Obtém o horário limite de cancelamento do estabelecimento
        const cancellationDeadline = order.establishment.cancellation_deadline_time;
        
        // Se não houver horário definido, permite cancelamento a qualquer momento
        if (!cancellationDeadline || cancellationDeadline === "00:00:00") {
            return true;
        }
    
        // Converte o horário limite para partes (horas, minutos, segundos)
        const [deadlineHours, deadlineMinutes, deadlineSeconds] = cancellationDeadline.split(':').map(Number);
        
        // Obtém a data atual
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
        
        // Obtém a data do pedido
        const orderDate = new Date(order.order_date);
        const isSameDay = orderDate.getDate() === now.getDate() && 
                         orderDate.getMonth() === now.getMonth() && 
                         orderDate.getFullYear() === now.getFullYear();
        
        // Se for o mesmo dia, verifica o horário
        if (isSameDay) {
            // Compara o horário atual com o horário limite
            if (currentHours > deadlineHours) {
                return false;
            } else if (currentHours === deadlineHours) {
                if (currentMinutes > deadlineMinutes) {
                    return false;
                } else if (currentMinutes === deadlineMinutes) {
                    return currentSeconds <= deadlineSeconds;
                }
            }
        }
        
        // Se não for o mesmo dia ou se estiver dentro do horário, permite cancelamento
        return true;
    }

}

export default new OrderService();
