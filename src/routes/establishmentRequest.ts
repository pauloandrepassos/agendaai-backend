import { validateEstablishmentRequest } from "../validators/validateEstablishmentRequest ";
import establishmentRequestService from "../services/establishmentRequestService";
import { Router, Request, Response } from "express";

const router = Router()

router.get("/establishmentRequest", async (req, res) => {
    try {
        const establishmentRequest = await establishmentRequestService.getAll()
        if(!establishmentRequest) {
            res.status(404).json({ message: "Solicitações não encontradas"});
        }
        res.status(200).json(establishmentRequest)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao listar Solicitações"})
    }
})

router.get("/establishmentRequest/:id", async (req, res) => {
    try {
        const establishmentRequest = await establishmentRequestService.getById(Number(req.params.id))
        if(!establishmentRequest) {
            res.status(404).json({ message: "Solicitação não encontradas"});
        }
        res.status(200).json(establishmentRequest)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao buscar Solicitação"})
    }
})

router.post("/establishmentRequest", validateEstablishmentRequest, async (req: Request, res: Response) => {
    try {
        const establishmentRequestData = req.body;
        const newEstablishmentRequest = await establishmentRequestService.create(establishmentRequestData);
        res.status(201).json(newEstablishmentRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar Solicitação" });
    }
});

export default router