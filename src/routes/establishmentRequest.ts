import { Router, Request, Response } from "express";
import { validateEstablishmentRequest } from "../validators/validateEstablishmentRequest ";
import establishmentRequestService from "../services/establishmentRequestService";
import verifyToken from "../middlewares/authorization";
import { UserRequest } from "../types/request";
import CustomError from "../utils/CustomError";

const router = Router();

router.get("/establishment/request/all", verifyToken("admin"), async (req, res) => {
    try {
        const establishmentRequest = await establishmentRequestService.getAll();
        res.status(200).json(establishmentRequest);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao listar Solicitações" });
    }
});

router.get("/establishment/request/:id", verifyToken("admin"), async (req, res) => {
    try {
        const establishmentRequest = await establishmentRequestService.getById(Number(req.params.id));
        res.status(200).json(establishmentRequest);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar Solicitação" });
    }
});

router.get("/establishment/request", verifyToken(), async (req: UserRequest, res: Response) => {
    try {
        const establishmentRequest = await establishmentRequestService.getByVendorId(Number(req.userId));
        res.status(200).json(establishmentRequest);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar Solicitação" });
    }
});

router.post("/establishment/request", validateEstablishmentRequest, async (req: Request, res: Response) => {
    try {
        const establishmentRequestData = req.body;
        const newEstablishmentRequest = await establishmentRequestService.create(establishmentRequestData);
        res.status(201).json(newEstablishmentRequest);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao criar Solicitação" });
    }
});

router.patch("/establishment/request/:id/approve", verifyToken("admin"), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateRequest = await establishmentRequestService.approveRequest(Number(id));
        res.status(200).json({ message: "Status atualizado com sucesso", updateRequest });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar status" });
    }
});

router.post("/establishment/request/complete", async (req: Request, res: Response) => {
    try {
        const { token, email } = req.body;
        const newEstablishment = await establishmentRequestService.completeRegistration(token, email);
        res.status(200).json({ message: "Estabelecimento criado com sucesso", newEstablishment });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao completar cadastro" });
    }
});

export default router;
