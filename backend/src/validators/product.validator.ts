import { z } from "zod";

export const createProductSchema = z.object({
    sku: z
        .string()
        .trim()
        .min(1, "SKU is required")
        .max(50, "SKU cannot exceed 50 characters"),

    name: z
        .string()
        .trim()
        .min(1, "Product name is required")
        .max(255, "Product name cannot exceed 255 characters"),

    description: z
        .string()
        .trim()
        .min(1, "Description is required"),

    price: z
        .number({
            error: "Price must be a number",
        })
        .positive("Price must be greater than 0"),

    stock: z
        .number({
            error: "Stock must be a number",
        })
        .int("Stock must be an integer")
        .min(0, "Stock cannot be negative"),

    brand: z
        .string()
        .trim()
        .min(1, "Brand is required"),

    category: z
        .string()
        .trim()
        .min(1, "Category is required"),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

export const updateProductSchema =
  createProductSchema.partial();