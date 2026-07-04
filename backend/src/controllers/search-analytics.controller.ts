import { NextFunction, Request, Response } from "express";
import { searchAnalyticsService } from "../services/search-analytics.service";

export class SearchAnalyticsController {

    constructor(
        private serviceAnalytics = searchAnalyticsService
    ) { }

    getTrending = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.serviceAnalytics.getTrending();
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error)
        }

    }

    trackClick = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { query } = req.body;

            await this.serviceAnalytics.trackClick(query);

            return res.status(200).json({
                success: true,
                message: "Click tracked successfully.",
            });
        } catch (error) {
            next(error);
        }
    };
}