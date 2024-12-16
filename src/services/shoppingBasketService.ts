import { Repository } from "typeorm";
import AppDataSource from "../database/config";
import { ShoppingBasket } from "../models/ShoppingBasket";
import { ShoppingBasketItem } from "../models/ShoppingBasketItem";
import productService from "./productService";

class ShoppingBasketService {
    private shoppingBasketRepository: Repository<ShoppingBasket>;
    private shoppingBasketItemRepository: Repository<ShoppingBasketItem>;

    constructor() {
        this.shoppingBasketRepository = AppDataSource.getRepository(ShoppingBasket);
        this.shoppingBasketItemRepository = AppDataSource.getRepository(ShoppingBasketItem);
    }

    // Buscar cesto de compras pelo usuário
    public async getShoppingBasketWithItems(userId: number) {
        const shoppingBasket = await this.shoppingBasketRepository.findOne({
            where: { user: userId },
            relations: ["shoppingBasketItems", "shoppingBasketItems.product"],
        });

        if (!shoppingBasket) throw new Error("Carrinho de compras não encontrado");
         
        shoppingBasket.shoppingBasketItems.map((info)=>{
            console.log("nome",info.product.name)
        })
        return shoppingBasket;
    }

    // Adicionar item ao cesto
    public async addItemToBasket(userId: number, establishmentId: number, productId: number, quantity: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            let shoppingBasket = await this.shoppingBasketRepository.findOne({
                where: { user: userId, establishment: establishmentId },
                relations: ["shoppingBasketItems", "shoppingBasketItems.product"],
            });

            if (!shoppingBasket) {
                shoppingBasket = this.shoppingBasketRepository.create({
                    user: userId,
                    establishment: establishmentId,
                    total_price: 0,
                    shoppingBasketItems:[]
                });
                shoppingBasket = await queryRunner.manager.save(shoppingBasket);
            }

            const product = await productService.getProductById(productId);
            if (!product) throw new Error("Produto não encontrado");

            const existingItem = shoppingBasket.shoppingBasketItems.find(
                (item) => item.product.id === productId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
                await queryRunner.manager.save(existingItem);
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
                (total, item) => total + item.product.price * item.quantity, 0
            );

            await queryRunner.manager.save(shoppingBasket);
            await queryRunner.commitTransaction();
            return shoppingBasket;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error("Erro ao adicionar item ao carrinho: " + error);
        } finally {
            await queryRunner.release();
        }
    }

    // Remover item do cesto
    public async removeItemFromBasket(userId: number, itemId: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const shoppingBasket = await this.shoppingBasketRepository.findOne({
                where: { user: userId },
                relations: ["shoppingBasketItems", "shoppingBasketItems.product"],
            });

            if (!shoppingBasket) throw new Error("Cesto de compras não encontrado");

            const shoppingBasketItem = shoppingBasket.shoppingBasketItems.find(
                (item) => item.id === itemId
            );

            if (!shoppingBasketItem) throw new Error("Item não encontrado no cesto");

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
                return { message: "Cesto de compras removido" };
            }

            shoppingBasket.total_price = shoppingBasket.shoppingBasketItems.reduce(
                (total, item) => total + item.product.price * item.quantity, 0
            );

            await queryRunner.manager.save(shoppingBasket);
            await queryRunner.commitTransaction();
            return shoppingBasket;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error("Erro ao remover item do carrinho: " + error);
        } finally {
            await queryRunner.release();
        }
    }

    // Remover o cesto de compras
    public async removeBasket(userId: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const shoppingBasket = await this.shoppingBasketRepository.findOne({
                where: { user: userId },
                relations: ["shoppingBasketItems"],
            });

            if (!shoppingBasket) throw new Error("Cesto de compras não encontrado");

            const removedItems = await queryRunner.manager.remove(shoppingBasket.shoppingBasketItems);

            if (removedItems.length > 0) {
                await queryRunner.manager.remove(shoppingBasket);
                await queryRunner.commitTransaction();
                return { message: "Cesto de compras e itens removidos com sucesso" };
            }

            throw new Error("Falha ao remover itens do cesto");

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error("Erro ao remover cesto de compras: " + error);
        } finally {
            await queryRunner.release();
        }
    }
    
    // Remover item completo do cesto (todas as quantidades)
    public async removeItemCompletelyFromBasket(userId: number, productId: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
    
        try {
            const shoppingBasket = await this.shoppingBasketRepository.findOne({
                where: { user: userId },
                relations: ["shoppingBasketItems", "shoppingBasketItems.product"],
            });
    
            if (!shoppingBasket) throw new Error("Cesto de compras não encontrado");
    
            const shoppingBasketItem = shoppingBasket.shoppingBasketItems.find(
                (item) => item.product.id === productId
            );
    
            if (!shoppingBasketItem) throw new Error("Item não encontrado no cesto");
    
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
            throw new Error("Erro ao remover item do carrinho: " + error);
        } finally {
            await queryRunner.release();
        }
    }
    
}

export default new ShoppingBasketService();
