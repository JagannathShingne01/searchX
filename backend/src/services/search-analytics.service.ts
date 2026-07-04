import { SearchAnalytics } from "@prisma/client";
import { SearchAnalyticsRepository } from "../repositories/search-analytics.repository";

export class SearchAnalyticsService {
    constructor(
        private repository = new SearchAnalyticsRepository()
    ) { }

    async track(query: string) {
        return this.repository.increment(query);
    }
    async getTrending(): Promise<SearchAnalytics[]> {
        const analytics = await this.repository.getTrending();

        const result = analytics.map((item) => ({
            ...item,
            popularityScore:
                item.searchCount * 0.4 +
                item.clickCount * 0.6,
        }));

        result.sort(
            (a, b) =>
                b.popularityScore -
                a.popularityScore
        );

        return result;
    }
    async trackClick(query: string) {
        return this.repository.incrementClick(query);
    }

    async getPopularityScores(queries: string[]): Promise<Map<string, number>> {
        const analytics =
            await this.repository.findByQueries(
                queries
            );

        const popularityMap = new Map<string, number>();
        for (const item of analytics) {
            const score =
                item.searchCount * 0.4 +
                item.clickCount * 0.6;

            popularityMap.set(
                item.query.toLowerCase(),
                score
            );
        }

        return popularityMap;
    }

}

export const searchAnalyticsService = new SearchAnalyticsService();