import "dotenv/config"; // MUST be the first import

import { Channel, ConsumeMessage } from "amqplib";
import { rabbitMQ } from "../config/rabbitmq";
import { ProductEvent, ProductRoutingKey, RabbitMQEvent } from "../types/rabbitmq.types";
import { SearchProduct } from "../types/search.types";
import { mapProductToSearch } from "../utils/product.mapper";
import { elasticsearchService } from "../services/elasticsearch.service";
import { rabbitMQPublisher } from "../utils/rabbitmq.publisher";
import { logger } from "../config/logger";

class ElasticsearchWorker {

    private readonly BATCH_SIZE = 100;
    private readonly FLUSH_INTERVAL = 2000;
    private products: SearchProduct[] = [];
    private messages: ConsumeMessage[] = [];
    private flushTimer: NodeJS.Timeout | null = null;

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

        logger.info("🚀 Elasticsearch Worker Started");
    }

    private async processMessage(channel: Channel, message: ConsumeMessage) {
        const MAX_RETRIES = 3;
        const event = JSON.parse(message.content.toString()) as RabbitMQEvent<any>;
        try {
            switch (event.event) {
                case ProductEvent.PRODUCT_CREATED: {
                    const product: SearchProduct =
                        mapProductToSearch(event.payload);

                    // await elasticsearchService.indexProduct(product);
                    this.products.push(product);
                    this.messages.push(message);

                    // Set a timer to flush the batch after a certain interval
                    if (!this.flushTimer) {
                        this.flushTimer = setTimeout(
                            async () => {
                                await this.flush(channel);
                            },
                            this.FLUSH_INTERVAL
                        );
                    }

                    // Flush the batch if it reaches the batch size
                    if (this.products.length >= this.BATCH_SIZE) {
                        await this.flush(channel);
                    }
                    break;
                }

                case ProductEvent.PRODUCT_UPDATED: {
                    const product: SearchProduct =
                        mapProductToSearch(event.payload);

                    await elasticsearchService.updateProduct(product);
                    channel.ack(message);
                    break;
                }

                case ProductEvent.PRODUCT_DELETED: {
                    await elasticsearchService.deleteProduct(
                        event.payload.id
                    );
                    channel.ack(message);
                    break;
                }

                case ProductEvent.PRODUCT_IMPORTED: {
                    const products = event.payload;
                    await elasticsearchService.bulkIndexProducts(
                        products.map(mapProductToSearch)
                    );
                    channel.ack(message);
                    break;
                }

                default:
                    console.warn(
                        `Unknown event received: ${event.event}`
                    );
            }
            logger.info(`✅ Processed ${event.event}`);
        } catch (error) {
            const retries = (event.retryCount ?? 0);
            if (retries < MAX_RETRIES) {
                await rabbitMQPublisher.publish(
                    ProductRoutingKey.PRODUCT_CREATED,
                    {
                        ...event,
                        retryCount: retries + 1,
                    }
                );
                channel.ack(message);
                return;
            }
            channel.nack(message, false, false);
        }
    }

    private async flush(channel: Channel): Promise<void> {
        if (this.products.length === 0) {
            return;
        }

        await elasticsearchService.bulkIndexProducts(
            this.products
        );

        for (const message of this.messages) {
            channel.ack(message);
        }

        logger.info({
            count: this.products.length,
        }, "Flushed products to Elasticsearch");

        this.products = [];
        this.messages = [];
        // Clear the flush timer after flushing
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
    }
}

export const elasticsearchWorker = new ElasticsearchWorker();