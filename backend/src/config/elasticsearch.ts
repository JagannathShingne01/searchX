import { Client } from "@elastic/elasticsearch";

export const elasticsearch = new Client({
    node: process.env.ELASTICSEARCH_NODE!,
});

export async function initializeElasticsearch() {
    try {
        await elasticsearch.ping();
        console.log("✅ Elasticsearch Connected");
        const index = process.env.ELASTICSEARCH_INDEX!;
        console.log(process.env.ELASTICSEARCH_INDEX!);
        const exists = await elasticsearch.indices.exists({
            index,
        });
        if (!exists) {
            console.log("Creating products index...");
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
                    }
                }
            },);
            console.log("✅ Products index created");
        } else {
            console.log("✅ Products index already exists");
        }
    } catch (error) {
        console.error("Elasticsearch initialization failed");
        console.error(error);
        process.exit(1);
    }
}