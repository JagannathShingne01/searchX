import { Router } from "express";
import { SearchController } from "../controllers/search.controller";
import { SearchService } from "../services/search.service";

const router = Router();

const service = new SearchService();
const controller = new SearchController(service);

router.get("/", controller.searchProducts);

export default router;