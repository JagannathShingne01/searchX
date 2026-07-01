import { rabbitMQ } from "../config/rabbitmq";
import { ProductRoutingKey, RabbitMQEvent } from "../types/rabbitmq.types";

class RabbitMQPublisher {
  async publish<T>(routingKey: ProductRoutingKey, event: RabbitMQEvent<T>): Promise<void> {
    const channel = rabbitMQ.getChannel();

    const published = channel.publish(
      process.env.RABBITMQ_EXCHANGE!,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        contentType: "application/json",
      }
    );

    if (!published) {
      throw new Error("Failed to publish message.");
    }

    console.log(
      `📨 Event Published: ${event.event}`
    );
  }
}

export const rabbitMQPublisher =
  new RabbitMQPublisher();