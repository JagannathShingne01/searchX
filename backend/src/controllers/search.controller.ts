import { Request, Response, NextFunction } from "express";
import { SearchService } from "../services/search.service";

export class SearchController {
  constructor(
    private readonly searchService: SearchService
  ) {}

  searchProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = String(req.query.q || "");

      const products =
        await this.searchService.searchProducts(query);

      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };
}