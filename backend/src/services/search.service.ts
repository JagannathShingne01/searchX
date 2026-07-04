import { redis } from "../config/redis";
import { elasticsearch } from "../config/elasticsearch";
import { ISearchResponse, SearchResult } from "../types/search.types";
import { getSearchVersion } from "../utils/cache";
import { SearchCompletionSuggestOption, SearchResponse } from "@elastic/elasticsearch/lib/api/types";
import { searchAnalyticsService } from "./search-analytics.service";

export class SearchService {
    private readonly index = process.env.ELASTICSEARCH_INDEX!;

    async searchProducts(query: string, page: number, limit: number, brand?: string, category?: string, minPrice?: number, maxPrice?: number, inStock?: boolean, sortBy?: string): Promise<ISearchResponse> {
        if (!query.trim()) {
            return {
                products: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0
                }
            };
        }
        if (query.length < 2) {
            return {
                products: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0
                }
            };
        }

        page = Math.max(page, 100);
        limit = Math.max(limit, 1);
        limit = Math.min(limit, 50);

        const from = (page - 1) * limit;

        if (from + limit > 10000) {
            throw new Error(
                "Maximum pagination limit exceeded."
            );
        }

        const version = await getSearchVersion();
        const cacheKey = `search:v${version}:${query}:${page}:${limit}:${brand ?? ""}:${category ?? ""}:${minPrice ?? ""}:${maxPrice ?? ""}:${inStock}:${sortBy ?? ""}`;

        // Step 1 - Check Redis Cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log("✅ Redis Cache Hit");

            return JSON.parse(cached);
        }

        console.log("❌ Redis Cache Miss");

        const filters: any[] = [];
        if (brand) {
            filters.push({
                term: {
                    "brand.keyword": brand
                }
            });
        }
        if (category) {
            filters.push({
                term: {
                    "category.keyword": category
                }
            });
        }
        if (
            minPrice !== undefined ||
            maxPrice !== undefined
        ) {
            filters.push({
                range: {
                    price: {
                        ...(minPrice !== undefined && {
                            gte: minPrice,
                        }),

                        ...(maxPrice !== undefined && {
                            lte: maxPrice,
                        }),
                    },
                },
            });
        }
        if (inStock) {
            filters.push({
                range: {
                    stock: {
                        gt: 0,
                    },
                },
            });
        }

        let sort: any[] = [];
        switch (sortBy) {
            case "price_asc":
                sort = [
                    {
                        price: { order: "asc" }
                    }
                ];
                break;

            case "price_desc":
                sort = [
                    {
                        price: { order: "desc" }
                    }
                ];
                break;

            case "newest":
                sort = [
                    {
                        createdAt: { order: "desc" }
                    }
                ];
                break;
            default:
                sort = [];
        }

        // Step 2 - Query Elasticsearch
        const response = await elasticsearch.search<SearchResult>({
            index: this.index,
            query: {
                bool: {
                    should: [
                        {
                            multi_match: {
                                query,
                                type: "bool_prefix",
                                fields: [
                                    "name",
                                    "name._2gram",
                                    "name._3gram"
                                ],
                                boost: 4
                            }
                        },
                        {
                            match: {
                                brand: {
                                    query,
                                    boost: 2
                                }
                            }
                        },
                        {
                            match: {
                                category: {
                                    query,
                                    boost: 1.5
                                }
                            }
                        },
                        {
                            fuzzy: {
                                name: {
                                    value: query,
                                    fuzziness: "AUTO",
                                    boost: 0.5
                                }
                            }
                        }

                    ],
                    filter: filters
                }
            },
            from,
            size: limit,
            sort
        });

        // Step 3 - Process Results
        const products =
            response.hits.hits
                .map((hit) => hit._source)
                .filter(Boolean) as SearchResult[];

        const queries = products.map((product) =>
            product.name.toLowerCase()
        );

        const popularity =
            await searchAnalyticsService.getPopularityScores(
                queries
            );

        const results = products.map((product) => ({
            ...product,
            popularityScore:
                popularity.get(product.name.toLowerCase()) ?? 0,

        }));

        if (sortBy === "popular") {
            results.sort(
                (a, b) =>
                    (b.popularityScore ?? 0) -
                    (a.popularityScore ?? 0)
            );

        }

        const total =
            typeof response.hits.total === "number"
                ? response.hits.total
                : response.hits.total?.value ?? 0;

        const searchResponse: ISearchResponse = {
            products: results,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };

        // Step 4 - Set Redis Cache
        await redis.set(
            cacheKey,
            JSON.stringify(searchResponse),
            {
                EX: 60,
            }
        );
        console.log("✅ ", searchResponse);

        void searchAnalyticsService.track(query);
        return searchResponse;
    }


    async getSuggestions(query: string): Promise<string[]> {
        query = query.trim().toLowerCase();
        if (query.length < 2) {
            return [];
        }

        const cacheKey = `suggest:${query}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            console.log("✅ Suggestion Cache Hit");
            return JSON.parse(cached);
        }

        console.log("❌ Suggestion Cache Miss");

        const response = await elasticsearch.search({
            index: this.index,
            suggest: {
                product_suggest: {
                    prefix: query,
                    completion: {
                        field: "suggest",
                        size: 10,
                        skip_duplicates: true
                    }
                }
            }
        });

        const options = response.suggest?.product_suggest?.[0]?.options as SearchCompletionSuggestOption<any>[] | undefined;

        const suggestions = options?.map(option => option.text) ?? [];

        // const suggestions =
        //     response.suggest?.product_suggest?.[0]?.options?.map(
        //         (option: any) => option.text
        //     ) ?? [];

        await redis.set(
            cacheKey,
            JSON.stringify(suggestions),
            {
                EX: 60,
            }
        );

        return suggestions;
    }
}

