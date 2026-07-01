import { Channel, ConsumeMessage } from "amqplib";
import { rabbitMQ } from "../config/rabbitmq";
import { ProductEvent } from "../types/rabbitmq.types";

class ElasticsearchWorker {
    async start() {
        const channel = rabbitMQ.getChannel();

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
            const event = JSON.parse(message.content.toString());
            switch (event.event) {
                case ProductEvent.PRODUCT_CREATED:
                    console.log(
                        event.payload
                    );
                    break;

                case ProductEvent.PRODUCT_UPDATED:

                    console.log(

                        event.payload

                    );

                    break;

                case ProductEvent.PRODUCT_DELETED:

                    console.log(

                        event.payload

                    );

                    break;

            }

            channel.ack(message);

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