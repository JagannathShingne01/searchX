import { logger } from "../config/logger";
import { rabbitMQ } from "../config/rabbitmq";
import { ProductEvent, ProductRoutingKey, RabbitMQEvent } from "../types/rabbitmq.types";
import { CreateProductDto } from "../validators/product.validator";

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

    logger.info({
      routingKey,
      event,
    }, "Message Published to RabbitMQ");
  }

  async publishProductsImported(
    products: CreateProductDto[]
  ): Promise<void> {
    await this.publish<CreateProductDto[]>(
      ProductRoutingKey.PRODUCT_IMPORTED,
      {
        event: ProductEvent.PRODUCT_IMPORTED,
        timestamp: new Date().toISOString(),
        payload: products,
      }
    );
  }
}

export const rabbitMQPublisher =
  new RabbitMQPublisher();