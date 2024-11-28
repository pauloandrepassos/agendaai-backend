import { validateOperatingHours } from "../validators/validateOperatingHours";
import operatingHoursService from "../services/operatingHoursService";
import { Router } from "express";
import { Request, Response } from 'express'

const router = Router()

router.post("/operating-hours", validateOperatingHours, async (req: Request, res: Response) => {
    try {
        const data = req.body
        const newOperatingHours = await operatingHoursService.create(data)
        res.status(201).json(newOperatingHours)
    } catch (error) {
        if (typeof error === "object" && error !== null && "details" in error && "message" in error) {
            res.status(409).json({
                message: error.message,
                conflicts: error.details,
            })
        } else if (error instanceof Error) {
            res.status(500).json({
                message: error.message,
            })
        } else {
            res.status(500).json({
                message: "Erro desconhecido ao adicionar horário",
            })
        }
    }
})
router.get("/operating-hours/establishment/:id", async (req: Request, res: Response) => {
    try {
        const establishmentId = parseInt(req.params.id, 10)
        const operatingHours = await operatingHoursService.getByEstablishmentId(establishmentId)
        res.status(200).json(operatingHours)
    } catch (error) {
        res.status(500).json({error})
    }
})

router.put("/operating-hours/:id", validateOperatingHours, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10)
        const data = req.body
        const updatedOperatingHour = await operatingHoursService.update(id, data)
        res.status(200).json(updatedOperatingHour)
    } catch (error) {
        if (typeof error === "object" && error !== null && "details" in error && "message" in error) {
            res.status(409).json({
                message: error.message,
                conflicts: error.details,
            })
        } else if (error instanceof Error) {
            res.status(500).json({
                message: error.message,
            })
        } else {
            res.status(500).json({
                message: "Erro desconhecido ao adicionar horário",
            })
        }
    }
})

router.delete("/operating-hours/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10)
        await operatingHoursService.delete(id)
        res.status(204).send()
    } catch (error) {
        res.status(500).json({message: "erro ao excluir horário", error})
    }
});

export default router