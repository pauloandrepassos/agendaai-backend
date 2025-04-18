import { Repository } from "typeorm";
import AppDataSource from "../database/config";
import { ShoppingBasket } from "../models/ShoppingBasket";
import { ShoppingBasketItem } from "../models/ShoppingBasketItem";
import productService from "./productService";
import CustomError from "../utils/CustomError";
import { Menu } from "../models/Menu";
import orderService from "./orderService";

class ShoppingBasketService {
    private shoppingBasketRepository: Repository<ShoppingBasket>;
    private shoppingBasketItemRepository: Repository<ShoppingBasketItem>;
    private menuRepository: Repository<Menu>

    constructor() {
        this.shoppingBasketRepository = AppDataSource.getRepository(ShoppingBasket);
        this.shoppingBasketItemRepository = AppDataSource.getRepository(ShoppingBasketItem);
        this.menuRepository = AppDataSource.getRepository(Menu)
    }

    public async getShoppingBasketWithItems(userId: number) {
        const shoppingBasket = await this.shoppingBasketRepository.findOne({
            where: { user_id: userId },
            relations: ["shoppingBasketItems", "shoppingBasketItems.product", "establishment", "menu"],
            order: {
                shoppingBasketItems: { created_at: "DESC" }
            }
        });

        if (!shoppingBasket) throw new CustomError("Carrinho de compras não encontrado", 404, "BASKET_NOT_FOUND");


        if (shoppingBasket.menu) {
            shoppingBasket.menu = { id: shoppingBasket.menu.id, day: shoppingBasket.menu.day } as Menu;
        }

        return shoppingBasket;
    }

    public async getShoppingBasketItemCount(userId: number): Promise<number> {
        const shoppingBasket = await this.shoppingBasketRepository.findOne({
            where: { user_id: userId },
            relations: ["shoppingBasketItems"],
        });

        if (!shoppingBasket || !shoppingBasket.shoppingBasketItems.length) {
            return 0;
        }

        // Calcula a quantidade total de itens no cesto, considerando a quantidade de cada item
        const totalQuantity = shoppingBasket.shoppingBasketItems.reduce((sum, item) => sum + item.quantity, 0);

        return totalQuantity;
    }

    public async addItemToBasket(
        userId: number,
        establishmentId: number,
        productId: number,
        quantity: number,
        menuId: number,
        orderDate?: string
    ) {
        const hasPendingOrder = await orderService.hasPendingOrder(userId);
        if (hasPendingOrder) {
            throw new CustomError("Você já tem um pedido pendente. Finalize o pedido atual antes de adicionar novos itens ao carrinho.", 400, "PENDING_ORDER_EXISTS");
        }
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const product = await productService.getProductById(productId);
            if (!product) {
                throw new CustomError("Produto não encontrado", 404, "PRODUCT_NOT_FOUND");
            }

            const menu = await this.menuRepository.findOne({ where: { id: menuId }, relations: ['menuItems'] });

            if (!menu) {
                throw new CustomError("Cardápio não encontrado", 404, "MENU_NOT_FOUND");
            }

            const menuDay = menu.day;

            let shoppingBasket = await this.shoppingBasketRepository.findOne({
                where: { user_id: userId },
                relations: ["menu", "shoppingBasketItems", "shoppingBasketItems.product"],
            });

            console.log("carrinho", shoppingBasket)
            if (!shoppingBasket) {
                console.log('Cesto não encontrado, criando um novo.');
                shoppingBasket = this.shoppingBasketRepository.create({
                    user_id: userId,
                    establishment: establishmentId,
                    menu: { id: menuId, day: menuDay },
                    total_price: 0,
                    shoppingBasketItems: [],
                    order_date: orderDate ? new Date(orderDate) : new Date(),
                });
                shoppingBasket = await queryRunner.manager.save(shoppingBasket);
            } else if (shoppingBasket.menu.id !== menuId) {
                throw new CustomError("Você só pode adicionar itens de um cardápio por vez", 400, "DIFFERENT_MENU");
            }

            const menuItem = menu.menuItems.find((item) => item.product_id === productId);
            if (!menuItem) {
                throw new CustomError("Produto não pertence a este cardápio", 400, "INVALID_MENU_ITEM");
            }

            if (shoppingBasket.menu.day !== menuDay) {
                throw new CustomError("O produto não pertence ao cardápio do dia correto", 400, "INVALID_DAY");
            }

            const existingItem = shoppingBasket.shoppingBasketItems.find(
                (item) => item.product.id === productId
            );
            if (existingItem) {
                existingItem.quantity += quantity;
                await queryRunner.manager.save(existingItem);
                console.log('Item atualizado:', existingItem);
            } else {
                const newItem = this.shoppingBasketItemRepository.create({
                    shopping_basket: shoppingBasket,
                    product: product,
                    quantity: quantity,
                });
                await queryRunner.manager.save(newItem);
                shoppingBasket.shoppingBasketItems.push(newItem);
            }

            shoppingBasket.total_price = shoppingBasket.shoppingBasketItems.reduce(
                (total, item) => total + item.product.price * item.quantity,
                0
            );

            await queryRunner.manager.save(shoppingBasket);
            await queryRunner.commitTransaction();
            return shoppingBasket;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao adicionar item ao carrinho", 500, "ADD_ITEM_ERROR", error);
        } finally {
            await queryRunner.release();
        }
    }
    public async removeItemFromBasket(userId: number, itemId: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const shoppingBasket = await this.shoppingBasketRepository.findOne({
                where: { user_id: userId },
                relations: ["shoppingBasketItems", "shoppingBasketItems.product"],
            });

            if (!shoppingBasket) throw new CustomError("Carrinho de compras não encontrado", 404, "BASKET_NOT_FOUND");

            const shoppingBasketItem = shoppingBasket.shoppingBasketItems.find(
                (item) => item.id === itemId
            );

            if (!shoppingBasketItem) throw new CustomError("Item não encontrado no carrinho", 404, "ITEM_NOT_FOUND");

            if (shoppingBasketItem.quantity > 1) {
                shoppingBasketItem.quantity -= 1;
                await queryRunner.manager.save(shoppingBasketItem);
            } else {
                shoppingBasket.shoppingBasketItems = shoppingBasket.shoppingBasketItems.filter(
                    (item) => item.id !== itemId
                );
                await queryRunner.manager.remove(shoppingBasketItem);
            }

            if (shoppingBasket.shoppingBasketItems.length === 0) {
                await queryRunner.manager.remove(shoppingBasket);
                await queryRunner.commitTransaction();
                return { message: "Carrinho removido" };
            }

            shoppingBasket.total_price = shoppingBasket.shoppingBasketItems.reduce(
                (total, item) => total + item.product.price * item.quantity, 0
            );

            await queryRunner.manager.save(shoppingBasket);
            await queryRunner.commitTransaction();
            return shoppingBasket;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof CustomError) throw error
            throw new CustomError("Erro ao remover item do carrinho", 500, "REMOVE_ITEM_ERROR", error);
        } finally {
            await queryRunner.release();
        }
    }

    public async removeBasket(userId: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const shoppingBasket = await this.shoppingBasketRepository.findOne({
                where: { user_id: userId },
                relations: ["shoppingBasketItems"],
            });

            if (!shoppingBasket) throw new CustomError("Carrinho de compras não encontrado", 404, "BASKET_NOT_FOUND");

            await queryRunner.manager.remove(shoppingBasket.shoppingBasketItems);
            await queryRunner.manager.remove(shoppingBasket);

            await queryRunner.commitTransaction();
            return { message: "Carrinho removido com sucesso" };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof CustomError) throw error
            if (error instanceof CustomError) throw error
            throw new CustomError("Erro ao remover carrinho de compras", 500, "REMOVE_BASKET_ERROR", error);
        } finally {
            await queryRunner.release();
        }
    }

    public async removeItemCompletelyFromBasket(userId: number, productId: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const shoppingBasket = await this.shoppingBasketRepository.findOne({
                where: { user_id: userId },
                relations: ["shoppingBasketItems", "shoppingBasketItems.product"],
            });

            if (!shoppingBasket) throw new CustomError("Carrinho de compras não encontrado", 404, "BASKET_NOT_FOUND");

            const shoppingBasketItem = shoppingBasket.shoppingBasketItems.find(
                (item) => item.product.id === productId
            );

            if (!shoppingBasketItem) throw new CustomError("Item não encontrado no carrinho", 404, "ITEM_NOT_FOUND");

            shoppingBasket.shoppingBasketItems = shoppingBasket.shoppingBasketItems.filter(
                (item) => item.product.id !== productId
            );
            await queryRunner.manager.remove(shoppingBasketItem);

            if (shoppingBasket.shoppingBasketItems.length === 0) {
                await queryRunner.manager.remove(shoppingBasket);
            } else {
                shoppingBasket.total_price = shoppingBasket.shoppingBasketItems.reduce(
                    (total, item) => total + item.product.price * item.quantity, 0
                );
                await queryRunner.manager.save(shoppingBasket);
            }

            await queryRunner.commitTransaction();
            return shoppingBasket;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof CustomError) throw error
            throw new CustomError("Erro ao remover item do carrinho", 500, "REMOVE_ITEM_ERROR", error);
        } finally {
            await queryRunner.release();
        }
    }
}

export default new ShoppingBasketService();
