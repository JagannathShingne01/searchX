import "dotenv/config"; // MUST be the first import

import { Channel, ConsumeMessage } from "amqplib";
import { rabbitMQ } from "../config/rabbitmq";
import { ProductEvent, RabbitMQEvent } from "../types/rabbitmq.types";
import { SearchProduct } from "../types/search.types";
import { mapProductToSearch } from "../utils/product.mapper";
import { elasticsearchService } from "../services/elasticsearch.service";

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

        console.log("🚀 Elasticsearch Worker Started");
    }

    private async processMessage(channel: Channel, message: ConsumeMessage) {

        try {
            const event = JSON.parse(message.content.toString()) as RabbitMQEvent<any>;
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

                default:
                    console.warn(
                        `Unknown event received: ${event.event}`
                    );
            }

            
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

        console.log(
            `Bulk Indexed ${this.products.length} Products`
        );

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