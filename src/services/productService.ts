import { Repository } from "typeorm";
import AppDataSource from "../database/config";
import { Product } from "../models/Product";

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

    public async getProductById(id: number) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ["establishment"],
        });
        if (!product) 
            throw new Error("Produto não encontrado");
        return product;
    }

    public async updateProduct(id: number, updatedData: Partial<Product>) {
        const product = await this.getProductById(id);
        if (!product) 
            throw new Error("Produto não encontrado");

        Object.assign(product, updatedData);
        return await this.productRepository.save(product);
    }

    public async deleteProduct(id: number) {
        const product = await this.getProductById(id);
        if (!product) 
            throw new Error("Produto não encontrado");
        return await this.productRepository.remove(product);
    }
}

export default new ProductService();
