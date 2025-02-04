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

            console.log("basket.order_date", basket.order_date);
            console.log("----------------------------------------------------------------------------------------------------------------------------------------");

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
            return await this.orderRepository.save(order);
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

}

export default new OrderService();
