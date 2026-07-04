// repositories/product.repository.ts

import { Prisma, Product } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import { IProductRepository } from "./interfaces/product.repository.interface";
import { CreateProductDto } from "../validators/product.validator";

export class ProductRepository extends BaseRepository implements IProductRepository {
    async create(data: Prisma.ProductCreateInput): Promise<Product> {
        return this.prisma.product.create({
            data
        });
    }

    async createMany(products: CreateProductDto[]): Promise<Prisma.BatchPayload> {
        return this.prisma.product.createMany({
            data: products,
            skipDuplicates: true,
        });
    }

    async findById(id: string) {
        return this.prisma.product.findUnique({
            where: { id }
        });
    }

    async findBySku(sku: string) {
        return this.prisma.product.findUnique({
            where: { sku }

        });
    }

    async findAll() {
        return this.prisma.product.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
    }

    async update(
        id: string,
        data: Prisma.ProductUpdateInput
    ) {
        return this.prisma.product.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return this.prisma.product.delete({
            where: { id }
        });

    }
}