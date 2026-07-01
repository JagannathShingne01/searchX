import amqp, { Channel, ChannelModel } from "amqplib";
import { ProductRoutingKey } from "../types/rabbitmq.types";
class RabbitMQManager {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL!
      );

      this.channel = await this.connection.createChannel();

      //Create if doesn't exist.
      await this.channel.assertExchange(
        process.env.RABBITMQ_EXCHANGE!,
        "direct",
        {
          durable: true,
        }
      );

      await this.channel.assertQueue(
        process.env.RABBITMQ_QUEUE!,
        {
          durable: true,
        }
      );

      await this.channel.bindQueue(
        process.env.RABBITMQ_QUEUE!,
        process.env.RABBITMQ_EXCHANGE!,
        ProductRoutingKey.PRODUCT_CREATED
      );

      await this.channel.bindQueue(
        process.env.RABBITMQ_QUEUE!,
        process.env.RABBITMQ_EXCHANGE!,
        ProductRoutingKey.PRODUCT_UPDATED
      );

      await this.channel.bindQueue(
        process.env.RABBITMQ_QUEUE!,
        process.env.RABBITMQ_EXCHANGE!,
        ProductRoutingKey.PRODUCT_DELETED
      );

      console.log("✅ RabbitMQ Connected");
    } catch (error) {
      console.error(
        "RabbitMQ Connection Failed",
        error
      );

      process.exit(1);
    }
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error(
        "RabbitMQ channel is not initialized."
      );
    }

    return this.channel;
  }

  async disconnect(): Promise<void> {
    await this.channel?.close();

    await this.connection?.close();

    console.log("RabbitMQ Connection Closed");
  }
}

export const rabbitMQ = new RabbitMQManager();