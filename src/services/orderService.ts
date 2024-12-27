import { Repository } from "typeorm";
import AppDataSource from "../database/config";
import { ShoppingBasket } from "../models/ShoppingBasket";
import { ShoppingBasketItem } from "../models/ShoppingBasketItem";
import { Order, OrderStatus } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { User } from "../models/User";
import { Establishment } from "../models/Establishment";

class OrderService {
    private orderRepository: Repository<Order>;
    private shoppingBasketRepository: Repository<ShoppingBasket>;
    private userRepository: Repository<User>
    private establishmentRepository: Repository<Establishment>

    constructor() {
        this.orderRepository = AppDataSource.getRepository(Order);
        this.shoppingBasketRepository = AppDataSource.getRepository(ShoppingBasket);
        this.userRepository = AppDataSource.getRepository(User)
        this.establishmentRepository = AppDataSource.getRepository(Establishment)
    }

    public async createOrderFromBasket(userId: number,establishmentId: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
    
        try {
            const basket = await this.shoppingBasketRepository.findOne({
                where: { user: userId },
                relations: ["shoppingBasketItems", "shoppingBasketItems.product", "establishment"],
            });
            if (!basket || !basket.shoppingBasketItems.length) {
                throw new Error("Cesto de compras vazio ou não encontrado.");
            } 
    
            const totalPrice = basket.shoppingBasketItems.reduce(
                (total, item) => total + item.product.price * item.quantity,
                0
            );
    
            const user = await  this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error("Usuário não encontrado.");
            }
    
            const establishment = await this.establishmentRepository.findOne({
                where: { id: establishmentId }, 
            });
            if (!establishment) {
                throw new Error("Estabelecimento não encontrado.");
            }
    
            const order = this.orderRepository.create({
                user: {id:user.id},
                establishment: {id:establishment.id},
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
            if (error instanceof Error)
                throw new Error(`Erro ao criar pedido: ${error.message}`);
        } finally {
            await queryRunner.release();
        }
    }

    public async getOrdersByUserId(userId: number) {
        return await this.orderRepository.find({
            where: { user: { id: userId } },
            relations: ["establishment", "orderItems"],
        });
    }

    public async getOrderById(orderId: number) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ["establishment", "user", "orderItems"],
        });
        if (!order) throw new Error("Pedido não encontrado.");
        return order;
    }
    public async getOrdersByEstablishmentId(establishmentId: number) {
        try {
            const orders = await this.orderRepository.find({
                where: { establishment: { id: establishmentId } },
                relations: ["user", "orderItems", "orderItems.product"],
            });
    
            if (!orders.length) {
                throw new Error("Nenhum pedido encontrado para o estabelecimento informado.");
            }
    
            return orders;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Erro ao buscar pedidos do estabelecimento: ${error.message}`);
            }
            throw new Error("Erro desconhecido ao buscar pedidos do estabelecimento.");
        }
    }
    
    public async confirmOrderPickup(orderId: number) {
        const order = await this.getOrderById(orderId);
        if (!order) throw new Error("Pedido não encontrado.");

        order.status = OrderStatus.COMPLETED;
        return await this.orderRepository.save(order);
    }
}

export default new OrderService();
