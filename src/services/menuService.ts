import { Repository } from "typeorm";
import AppDataSource from "../database/config";
import { Menu } from "../models/Menu";
import { MenuItem } from "../models/MenuItem";
import productService from "./productService";
import establishmentService from "./establishmentService";

class MenuService {
    private menuRepository: Repository<Menu>;
    private menuItemRepository: Repository<MenuItem>;

    constructor() {
        this.menuRepository = AppDataSource.getRepository(Menu);
        this.menuItemRepository = AppDataSource.getRepository(MenuItem);
    }

    public async addMenuItem(userId: number, date: Date, itemIds: number[]) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const establishment = await establishmentService.getEstablishmentByVendorId(userId);
            if (!establishment) {
                throw new Error("Estabelecimento não encontrado.");
            }

            let menu = await this.menuRepository.findOne({
                where: { establishment_id: establishment.id, date },
                relations: ["menuItems"],
            });

            if (!menu) {
                menu = this.menuRepository.create({
                    date,
                    establishment_id: establishment.id,
                });
                menu = await queryRunner.manager.save(menu);
            }

            const existingMenuItemIds = menu.menuItems.map((menuItem) => menuItem.product_id);
            const newItems = itemIds.filter((itemId) => !existingMenuItemIds.includes(itemId));

            if (newItems.length === 0) {
                return menu;
            }

            const validProducts = await Promise.all(
                newItems.map(async (itemId) => {
                    const product = await productService.getProductById(itemId);
                    if (!product) {
                        throw new Error(`Produto com ID ${itemId} não encontrado.`);
                    }
                    return product;
                })
            );

            const menuItems = validProducts.map((product) =>
                this.menuItemRepository.create({
                    menu_id: menu.id,
                    product_id: product.id,
                })
            );

            await queryRunner.manager.save(menuItems);

            const updatedMenu = await this.menuRepository.findOne({
                where: { id: menu.id },
                relations: ["menuItems"],
            });

            await queryRunner.commitTransaction();
            return updatedMenu;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error("Erro ao adicionar itens ao cardápio: " + error);
        } finally {
            await queryRunner.release();
        }
    }

    public async removeMenuItemByVendor(vendorId: number, itemId: number): Promise<boolean> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const establishment = await establishmentService.getEstablishmentByVendorId(vendorId);
            if (!establishment) {
                throw new Error("Estabelecimento não encontrado para o vendedor.");
            }

            const menu = await this.menuRepository.findOne({
                where: { establishment_id: establishment.id },
            });

            if (!menu) {
                throw new Error("Cardápio não encontrado.");
            }

            const menuItem = await this.menuItemRepository.findOne({
                where: { menu_id: menu.id, product_id: itemId },
            });

            if (!menuItem) {
                return false;
            }

            await queryRunner.manager.remove(menuItem);

            await queryRunner.commitTransaction();
            return true;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error("Erro ao remover item do cardápio: " + error);
        } finally {
            await queryRunner.release();
        }
    }

    public async getMenuByVendorId(vendorId: number) {
        const establishment = await establishmentService.getEstablishmentByVendorId(vendorId);
        if (!establishment) {
            throw new Error("Estabelecimento não encontrado para o vendedor especificado.");
        }

        const menu = await this.menuRepository.findOne({
            where: { establishment_id: establishment.id },
            relations: ["menuItems", "menuItems.product"],
        });

        if (!menu) {
            throw new Error("Cardápio não encontrado para o estabelecimento do vendedor.");
        }

        return menu;
    }

    public async getMenuByEstablishmentId(establishmentId: number) {
        const menu = await this.menuRepository.findOne({
            where: { establishment_id: establishmentId },
            relations: ["menuItems", "menuItems.product"],
        });

        if (!menu) {
            return null;
        }

        return menu;
    }
}

export default new MenuService();
