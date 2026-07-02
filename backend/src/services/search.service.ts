import { redis } from "../config/redis";
import { elasticsearch } from "../config/elasticsearch";
import { SearchResult } from "../types/search.types";
import { getSearchVersion } from "../utils/cache";

export class SearchService {
    private readonly index = process.env.ELASTICSEARCH_INDEX!;

    async searchProducts(query: string): Promise<SearchResult[]> {
        if (!query.trim()) {
            return [];
        }
        if (query.length < 2) {
            return [];
        }
        const version = await getSearchVersion();
        const cacheKey = `search:v${version}:${query.toLocaleLowerCase()}`;
        /**
         * Step 1
         * Check Redis
         */
        const cached = await redis.get(cacheKey);

        if (cached) {
            console.log("✅ Redis Cache Hit");

            return JSON.parse(cached);
        }

        console.log("❌ Redis Cache Miss");

        /**
         * Step 2
         * Search Elasticsearch
         */
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

                    ]
                }
            },
            size: 10
        });

        /**
         * Step 3
         * Extract _source
         */
        const products =
            response.hits.hits
                .map((hit) => hit._source)
                .filter(Boolean) as SearchResult[];

        /**
         * Step 4
         * Save to Redis
         */
        await redis.set(
            cacheKey,
            JSON.stringify(products),
            {
                EX: 60,
            }
        );
        console.log("✅ ", products);
        return products;
    }
}

