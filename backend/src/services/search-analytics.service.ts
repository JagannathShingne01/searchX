import { SearchAnalytics } from "@prisma/client";
import { SearchAnalyticsRepository } from "../repositories/search-analytics.repository";
import { SearchExplainResponse } from "../types/search.types";
import { SEARCH_CONFIG } from "../config/search.config";

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

    async explainSearch(
        query: string
    ): Promise<SearchExplainResponse> {
        return {
            query,
            strategy: {
                autocomplete: {
                    enabled: true,
                    type: "bool_prefix",
                    boost: SEARCH_CONFIG.AUTOCOMPLETE_BOOST,
                },
                brand: {
                    enabled: true,
                    boost: SEARCH_CONFIG.BRAND_BOOST,
                },
                category: {
                    enabled: true,
                    boost: SEARCH_CONFIG.CATEGORY_BOOST,
                },
                fuzzy: {
                    enabled: true,
                    boost: SEARCH_CONFIG.FUZZY_BOOST,
                    fuzziness: "AUTO",
                },
                ranking: {
                    enabled: true,
                    formula:
                        "Elastic Score + Popularity Score",
                },
            },
            supportedFilters: [
                "brand",
                "category",
                "price",
                "stock",
            ],
            pagination: {
                maxLimit: SEARCH_CONFIG.MAX_LIMIT,
            },
        };
    }
}

export const searchAnalyticsService = new SearchAnalyticsService();