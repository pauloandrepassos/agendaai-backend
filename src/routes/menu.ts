import { Router, Request, Response } from "express";
import menuService from "../services/menuService";
import verifyToken from "../middlewares/authorization";
import { UserRequest } from "../types/request";

const menuRouter = Router();

// Endpoint para adicionar itens ao cardápio
menuRouter.post("/menu/add-items", verifyToken(""), async (req: UserRequest, res: Response) => {
    try {
        const { items, day } = req.body;
        console.log(req.body);
        const vendorId = req.userId;

        if (!day) {
            res.status(400).json({ error: "A data do cardápio é obrigatória." });
            return;
        }

        const updatedMenu = await menuService.addMenuItem(Number(vendorId), day, items);

        res.status(200).json({
            message: "Itens adicionados ao cardápio com sucesso.",
            menu: updatedMenu,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao adicionar itens ao cardápio", error });
    }
});

menuRouter.delete("/menu/establishments/:itemId", verifyToken(""), async (req: UserRequest, res: Response) => {
    try {
        const userId = Number(req.userId);
        const itemId = Number(req.params.itemId);

        const itemRemoved = await menuService.removeMenuItemByVendor(userId, itemId);

        if (!itemRemoved) {
            res.status(404).json({ message: "Item do cardápio não encontrado." });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao remover item do cardápio." });
    }
});

// Endpoint para listar o cardápio com os itens relacionados usando id do estabelecimento
menuRouter.get("/menu/establishment/:id", verifyToken(""), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const menu = await menuService.getMenuByEstablishmentId(Number(id));

        if (!menu) {
            res.status(404).json({ message: "Cardápio não encontrado!" });
            return;
        }

        res.status(200).json(menu);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar o cardápio" });
    }
});

// Endpoint para listar o cardápio com os itens relacionados usando id do usuário
menuRouter.get("/menu/establishment/", verifyToken(""), async (req: UserRequest, res: Response) => {
    try {
        const menu = await menuService.getMenuByVendorId(Number(req.userId));

        if (!menu) {
            res.status(404).json({ message: "Cardápio não encontrado!" });
            return;
        }

        res.status(200).json(menu);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar o cardápio" });
    }
});

export default menuRouter;
