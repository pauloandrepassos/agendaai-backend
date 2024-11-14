import { Request, Response } from "express"
import EstablishmentService from "../services/establishmentService"
import AddressService from "../services/addressService"
import { Router } from "express"

const establishmentRouter = Router()

// Rota para criar um novo estabelecimento com endereço
establishmentRouter.post("/establishments", async (req: Request, res: Response) => {
    try {
        // Primeiro, cria o endereço
        const newAddress = await AddressService.newAddress(req.body)

        // Agora, cria o estabelecimento e associa o objeto do endereço
        const newEstablishment = await EstablishmentService.newEstablishment({
            ...req.body,
            address_id: newAddress.id // Passando o objeto Address completo
        })

        res.status(201).json(newEstablishment)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao criar estabelecimento", error })
    }
})

// Rota para listar todos os estabelecimentos
establishmentRouter.get("/establishments", async (req: Request, res: Response) => {
    try {
        const establishments = await EstablishmentService.getAllEstablishments()
        res.status(200).json(establishments)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao listar estabelecimentos", error })
    }
})

// Rota para buscar um estabelecimento por ID
establishmentRouter.get("/establishments/:id", async (req: Request, res: Response) => {
    try {
        const establishment = await EstablishmentService.getEstablishmentById(Number(req.params.id))
        res.status(200).json(establishment)
    } catch (error) {
        console.error(error)
        res.status(404).json({ message: "Estabelecimento não encontrado", error })
    }
})

// Rota para atualizar um estabelecimento e seu endereço
establishmentRouter.put("/establishments/:id", async (req: Request, res: Response) => {
    try {
        const updatedData = req.body;
        const { addressData } = updatedData;

        // Verifica se o endereço foi fornecido para atualização
        if (addressData) {
            if (updatedData.address_id) {
                // Atualiza o endereço existente
                const updatedAddress = await AddressService.updateAddress(updatedData.address_id, addressData);
                updatedData.address_id = updatedAddress.id; // Atribui o id atualizado
            } else {
                // Se não existir address_id, cria um novo endereço
                const newAddress = await AddressService.newAddress(addressData);
                updatedData.address_id = newAddress.id;
            }
        }

        // Atualiza o estabelecimento com o novo endereço
        const updatedEstablishment = await EstablishmentService.updateEstablishment(Number(req.params.id), updatedData);
        res.status(200).json(updatedEstablishment);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao atualizar estabelecimento", error })
    }
})

// Rota para deletar um estabelecimento e seu endereço
establishmentRouter.delete("/establishments/:id", async (req: Request, res: Response) => {
    try {
        const establishment = await EstablishmentService.getEstablishmentById(Number(req.params.id))

        // Deleta o estabelecimento
        await EstablishmentService.deleteEstablishment(Number(req.params.id))

        res.status(204).send()
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao deletar estabelecimento", error })
    }
})

export default establishmentRouter
