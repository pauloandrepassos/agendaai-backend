import { Request, Response, Router } from "express";
import ProductService from "../services/productService";
import verifyToken from "../middlewares/authorization";

const productRouter = Router();

// Rota para criar um novo produto
productRouter.post("/products", verifyToken("vendor"), async (req: Request, res: Response) => {
    try {
        const { name, description, price, establishment_id } = req.body;

        const productData = { name, description, price, establishment_id };
        const newProduct = await ProductService.newProduct(productData);

        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar produto", error });
    }
});

// Rota para listar todos os produtos
productRouter.get("/products", verifyToken(), async (req: Request, res: Response) => {
    try {
        const products = await ProductService.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar produtos", error });
    }
});

// Rota para buscar um produto por ID
productRouter.get("/products/:id", verifyToken(), async (req: Request, res: Response) => {
    try {
        const product = await ProductService.getProductById(Number(req.params.id));
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: "Produto não encontrado", error });
    }
});

// Rota para atualizar um produto
productRouter.put("/products/:id", verifyToken("vendor"), async (req: Request, res: Response) => {
    try {
        const { name, description, price, establishment_id } = req.body;

        const updatedData = { name, description, price, establishment_id };
        const updatedProduct = await ProductService.updateProduct(Number(req.params.id), updatedData);

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar produto", error });
    }
});

// Rota para deletar um produto
productRouter.delete("/products/:id", verifyToken("vendor"), async (req: Request, res: Response) => {
    try {
        await ProductService.deleteProduct(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar produto", error });
    }
});

export default productRouter;
