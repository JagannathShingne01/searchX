import { Product, Prisma } from "@prisma/client";

export interface IProductRepository {
  create(data: Prisma.ProductCreateInput): Promise<Product>;

  findById(id: string): Promise<Product | null>;

  findBySku(sku: string): Promise<Product | null>;

  findAll(): Promise<Product[]>;

  update(id: string, data: Prisma.ProductUpdateInput): Promise<Product>;

  delete(id: string): Promise<Product>;
}