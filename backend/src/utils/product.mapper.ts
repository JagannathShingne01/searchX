import { Product } from "@prisma/client";
import { SearchProduct } from "../types/search.types";

// Prisma return type Product, but we need to map it to SearchProduct for Elasticsearch indexing
// Price is a Decimal type in Prisma, but we need to convert it to number for Elasticsearch
export function mapProductToSearch(
  product: Product
): SearchProduct {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    brand: product.brand,
    category: product.category,
    price: Number(product.price),
    stock: product.stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    suggest: {
        input: [
            product.name,
            product.brand,
            product.category
        ]
    }
  };
}