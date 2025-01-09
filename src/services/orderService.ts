import { Repository } from "typeorm";
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

    public async createOrderFromBasket(userId: number, establishmentId: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
    
        try {
            const basket = await this.shoppingBasketRepository.findOne({
                where: { user: userId },
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
                order_date: new Date(),
                status: OrderStatus.PENDING,
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
                relations: ["establishment", "orderItems"],
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
                relations: ["establishment", "user", "orderItems"],
            });
            if (!order) throw new CustomError("Pedido não encontrado.", 404, "ORDER_NOT_FOUND");
            return order;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao buscar pedido.", 500, "ORDER_FETCH_ERROR");
        }
    }

    public async getOrdersByVendorId(vendorId: number) {
        try {
            const establishment = await establishmentService.getEstablishmentByVendorId(vendorId);
            const orders = await this.orderRepository.find({
                where: { establishment: { id: establishment.id } },
                relations: ["user", "orderItems", "orderItems.product"],
            })
    
            if (!orders.length) {
                throw new CustomError("Nenhum pedido encontrado para o estabelecimento informado.", 404, "ESTABLISHMENT_ORDERS_NOT_FOUND");
            }
    
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
}

export default new OrderService();
