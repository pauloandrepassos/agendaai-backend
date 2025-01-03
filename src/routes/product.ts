import { Request, Response, Router } from "express";
import ProductService from "../services/productService";
import verifyToken from "../middlewares/authorization";
import { UserRequest } from "../types/request";
import establishmentService from "../services/establishmentService";
import multer from "multer";
import cloudinaryService from "../services/cloudinaryService";
import path from "path";
import fs from 'fs';
import CustomError from "../utils/CustomError";

const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new CustomError('Tipo de arquivo inválido. Aceitamos apenas JPEG, PNG, WEBP e JPG.', 400, 'INVALID_FILE_TYPE'));
        }
        cb(null, true);
    }
});

const productRouter = Router();

// Rota para criar um novo produto
productRouter.post("/products", verifyToken("vendor"), upload.single('image'), async (req: UserRequest, res: Response) => {
    try {
        const { name, description, price, category } = req.body;
        const vendorId = req.userId;

        const establishment = await establishmentService.getEstablishmentByVendorId(Number(vendorId));
        if (!establishment) {
            throw new CustomError("Estabelecimento não encontrado", 404, "ESTABLISHMENT_NOT_FOUND");
        }

        const establishment_id = establishment.id;

        if (!req.file) {
            throw new CustomError('Arquivo de imagem não encontrado', 400, 'IMAGE_NOT_FOUND');
        }

        const filePath = path.resolve(req.file.path);

        const uploadResult = await cloudinaryService.uploadImage(filePath);

        const productData = { name, description, price, category, establishment_id, image: uploadResult };
        const newProduct = await ProductService.newProduct(productData);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Erro ao excluir o arquivo local:", err);
            } else {
                console.log("Arquivo local excluído com sucesso");
            }
        });

        res.status(201).json(newProduct);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
        } else {
            console.error(error);
            res.status(500).json({ message: "Erro ao criar produto", error });
        }
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

// Rota para listar produtos de um estabelecimento específico
productRouter.get("/products/by-vendor", verifyToken('vendor'), async (req: UserRequest, res: Response) => {
    try {
        const vendorId = req.userId;
        const products = await ProductService.getAllEstablishmentProducts(Number(vendorId));
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: "Erro ao buscar produtos" });
    }
});

// Rota para buscar um produto por ID
productRouter.get("/products/:id", verifyToken(), async (req: Request, res: Response) => {
    try {
        const product = await ProductService.getProductById(Number(req.params.id));
        res.status(200).json(product);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
        } else {
            console.error(error);
            res.status(404).json({ message: "Produto não encontrado", error });
        }
    }
});

// Rota para atualizar um produto
productRouter.put("/products/:id", verifyToken("vendor"), async (req: Request, res: Response) => {
    try {
        const { name, description, price, category } = req.body;

        if (!name || !description || !price || !category) {
            throw new CustomError("Todos os campos são obrigatórios.", 400, "MISSING_FIELDS");
        }
        if (price <= 0) {
            throw new CustomError("O preço deve ser maior que zero.", 400, "INVALID_PRICE");
        }

        const updatedData = { name, description, price, category };
        const updatedProduct = await ProductService.updateProduct(Number(req.params.id), updatedData);

        res.status(200).json(updatedProduct);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
        } else {
            console.error(error);
            res.status(500).json({ message: "Erro ao atualizar produto", error });
        }
    }
});

// Rota para deletar um produto
productRouter.delete("/products/:id", verifyToken("vendor"), async (req: Request, res: Response) => {
    try {
        await ProductService.deleteProduct(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message, code: error.errorCode });
        } else {
            console.error(error);
            res.status(500).json({ message: "Erro ao deletar produto", error });
        }
    }
});

export default productRouter;
