import { UserRequest } from "../types/request";
import notificationService from "../services/notificationService";
import { Router } from "express";
import verifyToken from "../middlewares/authorization";

const notificationRouter = Router()

notificationRouter.get("/notifications", verifyToken(), async (req: UserRequest, res) => {
    try {
        const notifications = await notificationService.getUserNotifications(Number(req.userId))
        console.log(req.userId)
        res.status(200).json(notifications)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao listar notificações", error})
    }
})

notificationRouter.get("/notifications/unread-count", verifyToken(), async (req: UserRequest, res) => {
    try {
        const unreadCount = await notificationService.getUnreadNotificationsCount(Number(req.userId))
        res.status(200).json({ unreadCount })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao contar notificações não lidas", error })
    }
})

notificationRouter.post("/notifications/mark-as-read/:id", verifyToken(), async (req: UserRequest, res) => {
    try {
        const notificationId = Number(req.params.id)
        const userId = Number(req.userId)
        const notification = await notificationService.markAsRead(notificationId, userId)
        res.status(200).json(notification)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao marcar notificação como lida", error})
    }
})

export default notificationRouter