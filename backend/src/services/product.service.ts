import { Prisma, Product } from "@prisma/client";
import { IProductRepository } from "../repositories/interfaces/product.repository.interface";
import { AppError } from "../utils/errors/AppError";
import { rabbitMQPublisher } from "../utils/rabbitmq.publisher";
import { ProductEvent, ProductRoutingKey } from "../types/rabbitmq.types";

export class ProductService {

    constructor(
        private readonly repository: IProductRepository
    ) { }

    async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
        const existingProduct = await this.repository.findBySku(
            data.sku
        );
        if (existingProduct) {
            throw new AppError(
                "Product with this SKU already exists.",
                409
            );
        }

        const product = await this.repository.create(data);

        // Publish the product creation event to RabbitMQ
        await rabbitMQPublisher.publish(
            ProductRoutingKey.PRODUCT_CREATED,
            {
                event: ProductEvent.PRODUCT_CREATED,
                timestamp: new Date().toISOString(),
                payload: product,
            });

        return product;
    }

    async getProductById(id: string): Promise<Product> {
        const product = await this.repository.findById(id);
        if (!product) {
            throw new AppError(
                "Product not found.",
                404
            );
        }

        return product;
    }

    async getAllProducts(): Promise<Product[]> {
        return this.repository.findAll();
    }

    async updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
        const existingProduct = await this.repository.findById(id);
        if (!existingProduct) {
            throw new AppError(
                "Product not found.",
                404
            );
        }

        if (data.sku && typeof data.sku === "string"
        ) {
            const skuExists = await this.repository.findBySku(data.sku);
            if (skuExists && skuExists.id !== id) {
                throw new AppError(
                    "SKU already exists.",
                    409
                );
            }
        }

        const updatedProduct = await this.repository.update(
            id,
            data
        );

        // Publish the product update event to RabbitMQ
        await rabbitMQPublisher.publish(
            ProductRoutingKey.PRODUCT_UPDATED,
            {
                event: ProductEvent.PRODUCT_UPDATED,
                timestamp: new Date().toISOString(),
                payload: updatedProduct,
            }
        );

        return updatedProduct;
    }

    async deleteProduct(id: string): Promise<Product> {
        const existingProduct = await this.repository.findById(id);
        if (!existingProduct) {
            throw new AppError(
                "Product not found.",
                404
            );
        }

        const deletedProduct = await this.repository.delete(id);

        // Publish the product deletion event to RabbitMQ
        await rabbitMQPublisher.publish(
            ProductRoutingKey.PRODUCT_DELETED,
            {
                event: ProductEvent.PRODUCT_DELETED,
                timestamp: new Date().toISOString(),
                payload: deletedProduct,
            });

        return deletedProduct;
    }
}