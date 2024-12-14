import { UserRequest } from "../types/request";
import { Response, Router } from "express";
import ShoppingBasketService from "../services/shoppingBasketService";
import verifyToken from "../middlewares/authorization";

const shoppingBasketRouter = Router();

// Rota para obter o cesto de compras com os itens
shoppingBasketRouter.get("/shopping-basket/items", verifyToken("client"), async (req: UserRequest, res: Response) => {
    try {
        const shoppingBasket = await ShoppingBasketService.getShoppingBasketWithItems(Number(req.userId));
        res.status(200).json(shoppingBasket);
    } catch (error) {
        if(error instanceof Error)
            res.status(400).json({ message: error.message });
    }
});

// Rota para adicionar itens ao cesto de compras
shoppingBasketRouter.post("/shopping-basket/items", verifyToken("vendor"), async (req: UserRequest, res: Response) => {
    const { establishmentId, productId, quantity } = req.body;

    try {
        const shoppingBasket = await ShoppingBasketService.addItemToBasket(
            Number(req.userId), 
            Number(establishmentId), 
            Number(productId), 
            quantity
        );
        res.status(201).json(shoppingBasket);
    } catch (error) {
        if(error instanceof Error)
            res.status(400).json({ message: error.message });
    }
});

// Rota para remover um item do cesto de compras
shoppingBasketRouter.delete("/shopping-basket/items/:id", verifyToken("client"), async (req: UserRequest, res: Response) => {
    const { id } = req.params;

    try {
        await ShoppingBasketService.removeItemFromBasket(
            Number(req.userId),
            Number(id)
        );
        res.status(204).send();
    } catch (error) {
        if(error instanceof Error)
            res.status(400).json({ message: error.message });
    }
});

// Rota para remover o cesto de compras e seus itens
shoppingBasketRouter.delete("/shopping-basket/:id", verifyToken("client"), async (req: UserRequest, res: Response) => {
    try {
        await ShoppingBasketService.removeBasket(Number(req.userId));
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default shoppingBasketRouter;
