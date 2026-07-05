import { Router } from "express";
import { SearchController } from "../controllers/search.controller";
import { SearchService } from "../services/search.service";
import { SearchAnalyticsService } from "../services/search-analytics.service";
import { SearchAnalyticsController } from "../controllers/search-analytics.controller";

const router = Router();

const service = new SearchService();
const controller = new SearchController(service);
const analyticsService = new SearchAnalyticsService();
const analyticsController = new SearchAnalyticsController(analyticsService);

router.get("/", controller.searchProducts);

router.get(
    "/suggestions", controller.getSuggestions
);

router.get(
    "/analytics/trending", analyticsController.getTrending
);

router.post(
  "/click",
  analyticsController.trackClick
);

router.get(
  "/explain",
  analyticsController.explainSearch
);
export default router;