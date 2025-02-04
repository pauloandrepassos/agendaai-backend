import { Router } from "express";
import { Request, Response } from "express";
import { UserRequest } from "../types/request";
import verifyToken from "../middlewares/authorization";
import EstablishmentService from "../services/establishmentService";
import { validateEstablishmentRequest } from "../validators/validateEstablishmentRequest ";
import CustomError from "../utils/CustomError";
import establishmentService from "../services/establishmentService";

const establishmentRouter = Router();

establishmentRouter.post("/establishments", verifyToken('admin'), async (req: Request, res: Response) => {
    try {
        const {
            name, logo, background_image, cnpj, zip_code, state, city,
            neighborhood, street, number, complement, reference_point,
            status, vendor_id
        } = req.body;

        const establishmentData = { name, logo, background_image, cnpj, status, vendor_id };
        const addressData = { zip_code, state, city, neighborhood, street, number, complement, reference_point };

        const newEstablishment = await EstablishmentService.newEstablishment(establishmentData, addressData);
        res.status(201).json(newEstablishment);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao criar estabelecimento", error });
    }
});

establishmentRouter.get("/establishments", verifyToken(), async (req: Request, res: Response) => {
    try {
        const establishments = await EstablishmentService.getAllEstablishments();
        res.status(200).json(establishments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar estabelecimentos", error });
    }
});

establishmentRouter.get("/establishments/by-vendor", verifyToken('vendor'), async (req: UserRequest, res: Response) => {
    try {
        const vendorId = req.userId;
        const establishment = await EstablishmentService.getEstablishmentByVendorId(Number(vendorId));
        res.status(200).json(establishment);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
            return
        }
        console.error(error);
        res.status(404).json({ message: "Estabelecimento não encontrado", error });
    }
});

establishmentRouter.get("/establishments/count", async (req, res) => {
    try {
        const count = await establishmentService.getEstablishmentCount();
        res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao contar usuários", error });
    }
})

establishmentRouter.get("/establishments/:id", verifyToken(), async (req: Request, res: Response) => {
    try {
        const establishment = await EstablishmentService.getEstablishmentById(Number(req.params.id));
        res.status(200).json(establishment);
    } catch (error) {
        if (error instanceof CustomError) {
         res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
         return
        }
        console.error(error);
        res.status(404).json({ message: "Estabelecimento não encontrado", error });
    }
});



establishmentRouter.put("/establishments/:id", verifyToken('vendor'), validateEstablishmentRequest, async (req: Request, res: Response) => {
    try {
        const {
            name, logo, background_image, cnpj, zip_code, state, city,
            neighborhood, street, number, complement, reference_point,
            status, vendor_id
        } = req.body;

        const establishmentData = { name, logo, background_image, cnpj, status, vendor_id };
        const addressData = { zip_code, state, city, neighborhood, street, number, complement, reference_point };

        const updatedEstablishment = await EstablishmentService.updateEstablishment(Number(req.params.id), establishmentData, addressData);
        res.status(200).json(updatedEstablishment);
    } catch (error) {
        if (error instanceof CustomError) {
             res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
             return
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar estabelecimento", error });
    }
});

export default establishmentRouter;
