import { Client } from "@elastic/elasticsearch";
import { logger } from "./logger";

export const elasticsearch = new Client({
    node: process.env.ELASTICSEARCH_NODE!,
});

export async function initializeElasticsearch() {
    try {
        await elasticsearch.ping();
        logger.info("✅ Elasticsearch Connected");
        const index = process.env.ELASTICSEARCH_INDEX!;
        const exists = await elasticsearch.indices.exists({
            index,
        });
        if (!exists) {
            logger.info("Creating products index...");
            await elasticsearch.indices.create({
                index,
                mappings: {
                    "properties": {
                        "id": {
                            "type": "keyword"
                        },
                        "sku": {
                            "type": "keyword"
                        },
                        "name": {
                            "type": "search_as_you_type"
                        },
                         "suggest":{
                            "type": "completion"
                        },
                        "description": {
                            "type": "text"
                        },
                        "brand": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword"
                                }
                            }
                        },
                        "category": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword"
                                }
                            }
                        },
                        "price": {
                            "type": "float"
                        },
                        "stock": {
                            "type": "integer"
                        }
                    },
                }
            },);
            logger.info("✅ Products index created");
        } else {
            logger.info("✅ Products index already exists");
        }
    } catch (error) {
       logger.error({
        error: error,
       }, "Elasticsearch connection failed");
       process.exit(1);
    }
}