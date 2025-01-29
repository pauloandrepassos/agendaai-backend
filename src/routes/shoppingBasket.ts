import { UserRequest } from "../types/request";
import { Response, Router } from "express";
import ShoppingBasketService from "../services/shoppingBasketService";
import verifyToken from "../middlewares/authorization";
import CustomError from "../utils/CustomError";

const shoppingBasketRouter = Router();

// Rota para obter o cesto de compras com os itens
shoppingBasketRouter.get("/shopping-basket/items", verifyToken("client"), async (req: UserRequest, res: Response) => {
    try {
        const shoppingBasket = await ShoppingBasketService.getShoppingBasketWithItems(Number(req.userId));
        res.status(200).json(shoppingBasket);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao obter cesto de compras", error });
    }
});

shoppingBasketRouter.get("/shopping-basket/count", verifyToken("client"), async (req: UserRequest, res: Response) => {
    try {
        const itemCount = await ShoppingBasketService.getShoppingBasketItemCount(Number(req.userId));
        res.status(200).json({ itemCount });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    }
});


// Rota para adicionar itens ao cesto de compras
shoppingBasketRouter.post("/shopping-basket/items", verifyToken("client"), async (req: UserRequest, res: Response) => {
    const { establishmentId, productId, quantity, menuId, orderDate} = req.body;

    console.log(`body ${req.body}`);
    console.log(req.userId);
    try {
        const shoppingBasket = await ShoppingBasketService.addItemToBasket(
            Number(req.userId), 
            Number(establishmentId), 
            Number(productId), 
            quantity,
            Number(menuId),
            orderDate
        );
        res.status(201).json(shoppingBasket);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao adicionar item ao cesto de compras", error });
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
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao remover item do cesto de compras", error });
    }
});

// Rota para remover o cesto de compras e seus itens
shoppingBasketRouter.delete("/shopping-basket", verifyToken("client"), async (req: UserRequest, res: Response) => {
    try {
        await ShoppingBasketService.removeBasket(Number(req.userId));
        res.status(204).send();
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao remover cesto de compras", error });
    }
});

// Rota para remover completamente um item do cesto de compras
shoppingBasketRouter.delete("/shopping-basket/items/:productId/remove", verifyToken("client"), async (req: UserRequest, res: Response) => {
    const { productId } = req.params;

    try {
        await ShoppingBasketService.removeItemCompletelyFromBasket(
            Number(req.userId),
            Number(productId)
        );
        res.status(204).send();
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao remover item do cesto de compras", error });
    }
});

export default shoppingBasketRouter;
