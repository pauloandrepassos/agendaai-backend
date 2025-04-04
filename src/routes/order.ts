import { Router, Request, Response } from "express";
import OrderService from "../services/orderService";
import verifyToken from "../middlewares/authorization";
import { UserRequest } from "../types/request";
import CustomError from "../utils/CustomError";
import orderService from "../services/orderService";

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
orderRoute.get("/order/:orderId", async (req: Request, res: Response) => {
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
        const { date } = req.query;
        console.log(date);
        const orders = await OrderService.getOrdersByVendorId(Number(req.userId), date ? String(date) : undefined);
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

// Rota para cancelar um pedido
orderRoute.patch("/order/:orderId/cancel", verifyToken("client"), async (req: UserRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await OrderService.cancelOrder(Number(req.userId), Number(orderId));
        res.status(200).json(updatedOrder);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    }
});

// Rota para obter as datas com pedidos de um estabelecimento
orderRoute.get("/orders/establishment/dates", verifyToken("vendor"), async (req: UserRequest, res: Response) => {
    try {
        const dates = await OrderService.getOrderDatesByEstablishmentId(Number(req.userId));
        res.status(200).json(dates);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    }
});

orderRoute.get("/orders/count", async (req, res) => {
    try {
        const count = await orderService.getOrdersCount();
        res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao contar usuários", error });
    }
})

export default orderRoute;
