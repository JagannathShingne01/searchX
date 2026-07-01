import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
    constructor(private readonly productService: ProductService) { }

    createProduct = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const product = await this.productService.createProduct(req.body);

            res.status(201).json({
                success: true,
                message: "Product created successfully",
                data: product,
            });
        } catch (error) {
            next(error);
        }
    };

    getAllProducts = async (
        _req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const products = await this.productService.getAllProducts();

            return res.status(200).json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    };

    getProductById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const product = await this.productService.getProductById(id);

            return res.status(200).json({
                success: true,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    };

    updateProduct = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

            const product = await this.productService.updateProduct(
                id,
                req.body
            );

            return res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: product,
            });
        } catch (error) {
            next(error);
        }
    };

    deleteProduct = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

            await this.productService.deleteProduct(id);

            return res.status(200).json({
                success: true,
                message: "Product deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    };
}