import { Repository } from "typeorm";
import AppDataSource from "../database/config";
import { ShoppingBasket } from "../models/ShoppingBasket";
import { ShoppingBasketItem } from "../models/ShoppingBasketItem";
import productService from "./productService";
import CustomError from "../utils/CustomError";
import { Menu } from "../models/Menu";

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
            where: { user: userId },
            relations: ["shoppingBasketItems", "shoppingBasketItems.product"],
        });

        if (!shoppingBasket) throw new CustomError("Carrinho de compras não encontrado", 404, "BASKET_NOT_FOUND");

        return shoppingBasket;
    }

    public async addItemToBasket(
        userId: number,
        establishmentId: number,
        productId: number,
        quantity: number,
        menuId: number 
    ) {
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
                where: { user: userId, establishment: establishmentId },
                relations: ["menu", "shoppingBasketItems", "shoppingBasketItems.product"],
            });
    
            if (!shoppingBasket) {
                console.log('Cesto não encontrado, criando um novo.');
                shoppingBasket = this.shoppingBasketRepository.create({
                    user: userId,
                    establishment: establishmentId,
                    menu: { id: menuId, day: menuDay },  
                    total_price: 0,
                    shoppingBasketItems: [],
                });
                shoppingBasket = await queryRunner.manager.save(shoppingBasket);
            } else if (shoppingBasket.menu.id !== menuId) {
                throw new CustomError("O cesto já está vinculado a outro cardápio", 400, "DIFFERENT_MENU");
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
                where: { user: userId },
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
                where: { user: userId },
                relations: ["shoppingBasketItems"],
            });

            if (!shoppingBasket) throw new CustomError("Carrinho de compras não encontrado", 404, "BASKET_NOT_FOUND");

            await queryRunner.manager.remove(shoppingBasket.shoppingBasketItems);
            await queryRunner.manager.remove(shoppingBasket);

            await queryRunner.commitTransaction();
            return { message: "Carrinho removido com sucesso" };

        } catch (error) {
            await queryRunner.rollbackTransaction();
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
                where: { user: userId },
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
            throw new CustomError("Erro ao remover item do carrinho", 500, "REMOVE_ITEM_ERROR", error);
        } finally {
            await queryRunner.release();
        }
    }
}

export default new ShoppingBasketService();
