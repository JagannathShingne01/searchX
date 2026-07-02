import "dotenv/config"; // MUST be the first import

import { Channel, ConsumeMessage } from "amqplib";
import { rabbitMQ } from "../config/rabbitmq";
import { ProductEvent, RabbitMQEvent } from "../types/rabbitmq.types";
import { SearchProduct } from "../types/search.types";
import { mapProductToSearch } from "../utils/product.mapper";
import { elasticsearchService } from "../services/elasticsearch.service";

class ElasticsearchWorker {
    async start() {
        const channel = rabbitMQ.getChannel();
        channel.prefetch(1);
        await channel.consume(
            process.env.RABBITMQ_QUEUE!,
            async (message) => {
                if (!message) return;

                await this.processMessage(
                    channel,
                    message
                );
            }
        );

        console.log("🚀 Elasticsearch Worker Started");
    }

    private async processMessage(channel: Channel, message: ConsumeMessage) {

        try {
            const event = JSON.parse(message.content.toString()) as RabbitMQEvent<any>;
            switch (event.event) {
                case ProductEvent.PRODUCT_CREATED: {
                    const product: SearchProduct =
                        mapProductToSearch(event.payload);

                    await elasticsearchService.indexProduct(product);

                    break;
                }

                case ProductEvent.PRODUCT_UPDATED: {
                    const product: SearchProduct =
                        mapProductToSearch(event.payload);

                    await elasticsearchService.updateProduct(product);

                    break;
                }

                case ProductEvent.PRODUCT_DELETED: {
                    await elasticsearchService.deleteProduct(
                        event.payload.id
                    );

                    break;
                }

                default:
                    console.warn(
                        `Unknown event received: ${event.event}`
                    );
            }

            channel.ack(message);
            console.log(`✅ Processed ${event.event}`);
        } catch (error) {
            console.error(error);
            channel.nack(
                message,
                false,
                true
            );
        }
    }
}

export const elasticsearchWorker = new ElasticsearchWorker();