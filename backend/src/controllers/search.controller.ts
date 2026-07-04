import { Request, Response, NextFunction } from "express";
import { SearchService } from "../services/search.service";

export class SearchController {
  constructor(
    private readonly searchService: SearchService
  ) { }
  searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = String(req.query.q || "");
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 10);
      const brand = req.query.brand as string | undefined;
      const category = req.query.category as string | undefined;
      const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
      const inStock = req.query.inStock === "true";
      const sortBy = req.query.sortBy as string | undefined;

      const products = await this.searchService.searchProducts(query, page, limit, brand, category, minPrice, maxPrice, inStock, sortBy);

      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  getSuggestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = String(req.query.q || "");

      const suggestions = await this.searchService.getSuggestions(query);

      return res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  };
}