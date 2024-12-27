import { Router, Request, Response } from "express";
import OrderService from "../services/orderService";
import verifyToken from "../middlewares/authorization";
import { UserRequest } from "../types/request";

const orderRoute = Router();

// Rota para criar um pedido a partir do cesto de compras
orderRoute.post("/shopping-basket/confirm", verifyToken("client"), async (req: UserRequest, res: Response) => {
    try {
        const order = await OrderService.createOrderFromBasket(Number(req.userId),Number(req.body.idEstablishment));
        res.status(201).json(order);
    } catch (error) {
        if(error instanceof Error)
        res.status(500).json({ message: error.message});
    }
});

// Rota para obter todos os pedidos de um usuário
orderRoute.get("/orders/user", verifyToken("client"), async (req: UserRequest, res: Response) => {
    try {
        const orders = await OrderService.getOrdersByUserId(Number(req.userId));
        res.status(200).json(orders);
    } catch (error) {
        if(error instanceof Error)
            res.status(500).json({ message: error.message});
    }
});

// Rota para obter detalhes de um pedido específico
orderRoute.get("/order/:orderId", verifyToken("vendor"), async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const order = await OrderService.getOrderById(Number(orderId));
        res.status(200).json(order);
    } catch (error: any) {
        if(error instanceof Error)
            res.status(404).json({ message: error.message});
    }
});

// Rota para obter todos os pedidos de um estabelecimento
orderRoute.get("/orders/establishment/:id", verifyToken("vendor"), async (req: Request, res: Response) => {
    try {
        const establishmentId = Number(req.params.id);

        if (!establishmentId || isNaN(establishmentId)) {
            res.status(400).json({ message: "ID do estabelecimento inválido." });
            return
        }

        const orders = await OrderService.getOrdersByEstablishmentId(establishmentId);
        res.status(200).json(orders);
    } catch (error) {
        if (error instanceof Error)
            res.status(500).json({ message: error.message });
    }
});

// Rota para confirmar a retirada de um pedido
orderRoute.patch("/order/:orderId/confirm-pickup", verifyToken("vendor"), async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await OrderService.confirmOrderPickup(Number(orderId));
        res.status(200).json(updatedOrder);
    } catch (error) {
        if(error instanceof Error)
            res.status(500).json({ message: error.message});
    }
});

export default orderRoute;
