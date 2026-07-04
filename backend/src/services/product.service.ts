import { Prisma, Product } from "@prisma/client";
import { BulkImportResponse, IProductRepository } from "../repositories/interfaces/product.repository.interface";
import { AppError } from "../utils/errors/AppError";
import { rabbitMQPublisher } from "../utils/rabbitmq.publisher";
import { ProductEvent, ProductRoutingKey } from "../types/rabbitmq.types";
import { incrementSearchVersion } from "../utils/cache";
import { CreateProductDto } from "../validators/product.validator";
import csv from "csv-parser";
import { Readable } from "stream";
import { logger } from "../config/logger";

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
        await incrementSearchVersion();
        logger.info({
            event: ProductEvent.PRODUCT_CREATED,
            payload: product.id
        }, "Product created and event published to RabbitMQ");
        return product;
    }

    async importProducts(fileBuffer: Buffer): Promise<BulkImportResponse> {
        const products: CreateProductDto[] = [];
        const BATCH_SIZE = 50;
        let imported = 0;

        await new Promise<void>((resolve, reject) => {
            Readable
                .from(fileBuffer)
                .pipe(csv())
                .on("data", (row) => {
                    products.push({
                        sku: row.sku,
                        name: row.name,
                        description: row.description,
                        brand: row.brand,
                        category: row.category,
                        price: Number(row.price),
                        stock: Number(row.stock),
                    });

                })
                .on("end", resolve)
                .on("error", reject);
        });

        for (let i = 0; i < products.length; i += BATCH_SIZE) {
            const batch = products.slice(i, i + BATCH_SIZE);
            const result = await this.repository.createMany(batch);
            imported += result.count;
            await rabbitMQPublisher.publishProductsImported(batch);
        }
        await incrementSearchVersion();
        logger.info({
            event: ProductEvent.PRODUCT_IMPORTED,
            payload: {
                total: products.length,
                imported,
                skipped: products.length - imported
            }
        }, "Products imported and event published to RabbitMQ");
        return {
            total: products.length,
            imported,
            skipped: products.length - imported

        };
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
        await incrementSearchVersion();
        logger.info({
            event: ProductEvent.PRODUCT_UPDATED,
            payload: updatedProduct.id
        }, "Product updated and event published to RabbitMQ");
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
        await incrementSearchVersion();
        logger.info({
            event: ProductEvent.PRODUCT_DELETED,
            payload: deletedProduct.id
        }, "Product deleted and event published to RabbitMQ");
        return deletedProduct;
    }
}