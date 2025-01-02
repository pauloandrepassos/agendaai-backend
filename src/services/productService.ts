import { Repository } from "typeorm";
import AppDataSource from "../database/config";
import { Product } from "../models/Product";
import establishmentService from "./establishmentService";
import CustomError from "../utils/CustomError";

class ProductService {
    private productRepository: Repository<Product>;

    constructor() {
        this.productRepository = AppDataSource.getRepository(Product);
    }

    public async newProduct(productData: Partial<Product>) {
        const product = this.productRepository.create(productData);
        return await this.productRepository.save(product);
    }

    public async getAllProducts() {
        return await this.productRepository.find({
            relations: ["establishment"],
        });
    }

    public async getAllEstablishmentProducts(vendorId: number) {
        const establishment = await establishmentService.getEstablishmentByVendorId(vendorId);
        if (!establishment) {
            throw new CustomError("Estabelecimento não encontrado", 404, "ESTABLISHMENT_NOT_FOUND");
        }

        const products = await this.productRepository.find({
            where: {
                establishment_id: establishment.id,
            },
        });
        return products;
    }

    public async getProductById(id: number) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ["establishment"],
        });
        if (!product) {
            throw new CustomError("Produto não encontrado", 404, "PRODUCT_NOT_FOUND");
        }
        return product;
    }

    public async updateProduct(id: number, updatedData: Partial<Product>) {
        const product = await this.getProductById(id);
        if (!product) {
            throw new CustomError("Produto não encontrado", 404, "PRODUCT_NOT_FOUND");
        }

        Object.assign(product, updatedData);
        return await this.productRepository.save(product);
    }

    public async deleteProduct(id: number) {
        const product = await this.getProductById(id);
        if (!product) {
            throw new CustomError("Produto não encontrado", 404, "PRODUCT_NOT_FOUND");
        }
        return await this.productRepository.remove(product);
    }

    public async verifyProductById(id: number) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ["establishment"],
        });
        if (!product) {
            throw new CustomError("Produto não encontrado", 404, "PRODUCT_NOT_FOUND");
        }
        return product;
    }
}

export default new ProductService();
