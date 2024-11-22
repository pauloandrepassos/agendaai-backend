import { Request, Response } from "express"
import EstablishmentService from "../services/establishmentService"
import { Router } from "express"
import { validateEstablishmentRequest } from "../validators/validateEstablishmentRequest "
import verifyToken from "../middlewares/authorization"

const establishmentRouter = Router()

// Rota para criar um novo estabelecimento com endereço
establishmentRouter.post("/establishments", verifyToken('admin'), async (req: Request, res: Response) => {
    try {
        const { name, logo, background_image, cnpj, zip_code, state, city, neighborhood, street, number, complement, reference_point, status, vendor_id
        } = req.body;

        // Dados do estabelecimento
        const establishmentData = { name, logo, background_image, cnpj, status, vendor_id
        };

        // Dados do endereço
        const addressData = { zip_code, state, city, neighborhood, street, number, complement, reference_point
        };

        const newEstablishment = await EstablishmentService.newEstablishment( establishmentData, addressData)

        res.status(201).json(newEstablishment)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao criar estabelecimento", error })
    }
})

// Rota para listar todos os estabelecimentos
establishmentRouter.get("/establishments", verifyToken(), async (req: Request, res: Response) => {
    try {
        const establishments = await EstablishmentService.getAllEstablishments()
        res.status(200).json(establishments)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao listar estabelecimentos", error })
    }
})

// Rota para buscar um estabelecimento por ID
establishmentRouter.get("/establishments/:id", verifyToken(), async (req: Request, res: Response) => {
    try {
        const establishment = await EstablishmentService.getEstablishmentById(Number(req.params.id))
        res.status(200).json(establishment)
    } catch (error) {
        console.error(error)
        res.status(404).json({ message: "Estabelecimento não encontrado", error })
    }
})

// Rota para atualizar um estabelecimento e seu endereço
establishmentRouter.put("/establishments/:id", verifyToken('vendor'), validateEstablishmentRequest, async (req: Request, res: Response) => {
    try {
        const { name, logo, background_image, cnpj, zip_code, state, city, neighborhood, street, number, complement, reference_point, status, vendor_id
        } = req.body;

        // Dados do estabelecimento
        const establishmentData = { name, logo, background_image, cnpj, status, vendor_id
        };

        // Dados do endereço
        const addressData = { zip_code, state, city, neighborhood, street, number, complement, reference_point
        };

        const updatedEstablishment = await EstablishmentService.updateEstablishment(Number(req.params.id), establishmentData, addressData);

        res.status(200).json(updatedEstablishment);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao atualizar estabelecimento", error })
    }
})

// Rota para deletar um estabelecimento e seu endereço
/*
establishmentRouter.delete("/establishments/:id", async (req: Request, res: Response) => {
    try {
        await EstablishmentService.deleteEstablishment(Number(req.params.id))

        res.status(204).send()
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao deletar estabelecimento", error })
    }
})*/

export default establishmentRouter
