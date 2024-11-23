import operatingHoursService from "../services/operatingHoursService";
import { Router } from "express";
import { Request, Response } from 'express'

const router = Router()

router.post("/operating-hours", async (req: Request, res: Response) => {
    try {
        const data = req.body
        const newOperatingHours = await operatingHoursService.create(data)
        res.status(201).json(newOperatingHours)
    } catch (error) {
        res.status(409).json({
            message: error instanceof Error ? error.message : "Erro ao adicionar horário",
        })
    }
})

export default router