import { validateEstablishmentRequest } from "../validators/validateEstablishmentRequest ";
import establishmentRequestService from "../services/establishmentRequestService";
import { Router, Request, Response } from "express";
import verifyToken from "../middlewares/authorization";

const router = Router()

router.get("/establishmentRequest", verifyToken('admin'), async (req, res) => {
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

router.get("/establishmentRequest/:id", verifyToken('admin'), async (req, res) => {
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

router.patch("/establishmentRequest/:id/approve", verifyToken('admin'), async  (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const updateRequest = await establishmentRequestService.approveRequest(Number(id))
        res.status(200).json({ message: "Status atualizado com sucesso", updateRequest})
    } catch {
        res.status(500).json({ message: "Erro aoatualizar status" });
    }
})

router.post("/establishmentRequest/complete", async(req: Request, res: Response) => {
    try {
        const { token, email } = req.body
        const newEstablishment = await establishmentRequestService.CompleteRegistration(token, email)
        res.status(200).json({ message: "estabelecimento criado com sucesso", newEstablishment})

    } catch (error) {
        let status = 500
        let message = "Erro ao completar cadastro"

        if (error instanceof Error) {
            if (error.message === "SECRET_KEY não está definido nas variáveis de ambiente") {
                status = 500
                message = "Erro de servidor"
            } else if (error.message === "Token inválido ou não corresponde ao email fornecido") {
                status = 400
                message = error.message
            } else if (error.message === "Usuário não encontrado") {
                status = 404
                message = error.message
            } else if (error.message === "Solicitação não encontrada") {
                status = 404
                message = error.message
            } else if (error.message.startsWith("Erro ao criar estabelecimento e endereço")) {
                status = 500
                message = error.message
            }
        }

        res.status(status).json({ message })
    }
})

export default router