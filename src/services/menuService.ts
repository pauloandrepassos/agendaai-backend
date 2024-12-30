import { Repository } from "typeorm";
import AppDataSource from "../database/config";
import { Menu } from "../models/Menu";
import { MenuItem } from "../models/MenuItem";
import productService from "./productService";
import establishmentService from "./establishmentService";
import { Day } from "../models/OperatingHours";

class MenuService {
    private menuRepository: Repository<Menu>;
    private menuItemRepository: Repository<MenuItem>;

    constructor() {
        this.menuRepository = AppDataSource.getRepository(Menu);
        this.menuItemRepository = AppDataSource.getRepository(MenuItem);
    }

    public async addMenuItem(userId: number, day: Day, itemIds: number[]) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const establishment = await establishmentService.getEstablishmentByVendorId(userId);
            if (!establishment) {
                throw new Error("Estabelecimento não encontrado.");
            }

            let menu = await queryRunner.manager.findOne(Menu, {
                where: { establishment_id: establishment.id, day },
                relations: ["menuItems"],
            });

            if (!menu) {
                menu = this.menuRepository.create({
                    day,
                    establishment_id: establishment.id,
                });
                menu = await queryRunner.manager.save(menu);
            }

            const existingMenuItemIds = (menu.menuItems || []).map((menuItem) => menuItem.product_id);
            const newItems = itemIds.filter((itemId) => !existingMenuItemIds.includes(itemId));

            if (newItems.length === 0) {
                await queryRunner.commitTransaction();
                return menu;
            }

            const validProducts = (
                await Promise.all(
                    newItems.map(async (itemId) => {
                        const product = await productService.verifyProductById(itemId);
                        if (product) {
                            return product;
                        } else {
                            console.log(`Produto com ID ${itemId} não encontrado. Ignorando.`)
                            return null;
                        }
                    })
                )
            ).filter((product) => product !== null)

            const menuItems = validProducts.map((product) =>
                this.menuItemRepository.create({
                    menu_id: menu.id,
                    product_id: product.id,
                })
            );

            await queryRunner.manager.save(menuItems);

            const updatedMenu = await queryRunner.manager.findOne(Menu, {
                where: { id: menu.id },
                relations: ["menuItems"],
            });

            await queryRunner.commitTransaction();
            return updatedMenu;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(error); // Log detalhado para ajudar na depuração
            throw new Error("Erro ao adicionar itens ao cardápio");
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

        const menu = await this.getMenuByEstablishmentId(establishment.id)

        return menu;
    }

    public async getMenuByEstablishmentId(establishmentId: number) {
        const menus = await this.menuRepository.find({
            where: { establishment_id: establishmentId },
            relations: ["menuItems.product"],
        });
    
        if (!menus.length) {
            return [];
        }

        const formattedMenus = menus.map((menu) => ({
            id: menu.id,
            establishment_id: menu.establishment_id,
            day: menu.day,
            menuItems: menu.menuItems.map((menuItem) => ({
                id: menuItem.product.id,
                name: menuItem.product.name,
                image: menuItem.product.image,
                price: menuItem.product.price,
                category: menuItem.product.category,
            })),
        }));
    
        return formattedMenus;
    }    
}

export default new MenuService();
