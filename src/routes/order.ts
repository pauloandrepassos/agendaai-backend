import { Router, Request, Response } from "express";
import OrderService from "../services/orderService";
import verifyToken from "../middlewares/authorization";
import { UserRequest } from "../types/request";
import CustomError from "../utils/CustomError";

const orderRoute = Router();

// Rota para criar um pedido a partir do cesto de compras
orderRoute.post("/shopping-basket/confirm", verifyToken("client"), async (req: UserRequest, res: Response) => {
    try {
        const { idEstablishment, pickupTime } = req.body;

        if(!pickupTime) {
            throw new CustomError("Horário de retirada não informado.", 400, "MISSING_PICKUP_TIME");
        }

        const order = await OrderService.createOrderFromBasket(Number(req.userId), Number(idEstablishment), pickupTime);
        res.status(201).json(order);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    }
});

// Rota para obter todos os pedidos de um usuário
orderRoute.get("/orders/user", verifyToken("client"), async (req: UserRequest, res: Response) => {
    try {
        const orders = await OrderService.getOrdersByUserId(Number(req.userId));
        res.status(200).json(orders);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    }
});

// Rota para obter detalhes de um pedido específico
orderRoute.get("/order/:orderId", verifyToken("vendor"), async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const order = await OrderService.getOrderById(Number(orderId));
        res.status(200).json(order);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    }
});

// Rota para obter todos os pedidos de um estabelecimento
orderRoute.get("/orders/establishment", verifyToken("vendor"), async (req: UserRequest, res: Response) => {
    try {
        const orders = await OrderService.getOrdersByVendorId(Number(req.userId));
        res.status(200).json(orders);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    }
});

// Rota para confirmar a retirada de um pedido
orderRoute.patch("/order/:orderId/confirm-pickup", verifyToken("vendor"), async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await OrderService.confirmOrderPickup(Number(orderId));
        res.status(200).json(updatedOrder);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    }
});

export default orderRoute;
