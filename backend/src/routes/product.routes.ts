import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";
import { ProductRepository } from "../repositories/product.repository";
import { ProductService } from "../services/product.service";
import { ProductController } from "../controllers/product.controller";
import { upload } from "../config/multer";

const router = Router();

const repository = new ProductRepository();
const service = new ProductService(repository);
const controller = new ProductController(service);

router.post(
  "/",
  validate(createProductSchema),
  controller.createProduct
  
);

router.post(
  "/import",
  upload.single("file"),
  controller.importProducts
);

router.get(
  "/",
  controller.getAllProducts
);

router.get(
  "/:id",
  controller.getProductById
);

router.put(
  "/:id",
  validate(updateProductSchema),
  controller.updateProduct
);

router.delete(
  "/:id",
  controller.deleteProduct
);

export default router;