import { UserRequest } from "../types/request";
import verifyToken from "../middlewares/authorization";
import operatingHoursService from "../services/operatingHoursService";
import { Router } from "express";

const router = Router()
router.get("/operating-hours/establishment", verifyToken("vendor"), async (req: UserRequest, res) => {
    try {
        const hours = await operatingHoursService.getByVendorId(Number(req.userId));
        res.json(hours);
    } catch (error) {
        console.error("Erro ao buscar horários:", error);
        res.status(500).json({ message: "Erro ao buscar horários", error });
    }
});

router.get("/operating-hours/establishment/:id", verifyToken(""), async (req, res) => {
    try {
        const { id } = req.params;
        const hours = await operatingHoursService.getByEstablishment(Number(id));
        res.json(hours);
    } catch (error) {
        console.error("Erro ao buscar horários:", error);
        res.status(500).json({ message: "Erro ao buscar horários", error });
    }
});

router.post("/operating-hours", verifyToken("vendor"), async (req: UserRequest, res) => {
    try {
        const { hours } = req.body;
        if (!hours) {
            res.status(400).json({ message: "Dados inválidos" });
            return
        }
        console.log(`horariosssssssssss: ${hours}`)
        const savedHours = await operatingHoursService.saveOperatingHours(Number(req.userId), hours);
        res.status(201).json(savedHours);
    } catch (error) {
        console.error("Erro ao salvar horários:", error);
        res.status(500).json({ message: "Erro ao salvar horários", error });
    }
});

export default router