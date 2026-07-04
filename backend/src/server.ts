import dotenv from "dotenv";
import { Server } from "http";

import app from "./app";
import { rabbitMQ } from "./config/rabbitmq";
import { initializeElasticsearch } from "./config/elasticsearch";
import { initializeRedis, redis } from "./config/redis";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";

dotenv.config();

const PORT = process.env.PORT || 5000;

let server: Server;
let shuttingDown = false;

async function startServer() {
    try {
        await rabbitMQ.connect();
        await initializeElasticsearch();
        await initializeRedis();

        server = app.listen(PORT, () => {
            logger.info(`Server running on ${PORT}`);
        });

    } catch (error) {
        logger.error(error, "Server failed to start");
        process.exit(1);
    }
}

async function shutdown(signal: string) {
    if (shuttingDown) return;

    shuttingDown = true;

    logger.info(`Received ${signal}`);
    logger.info("Graceful shutdown started");

    try {

        // Stop accepting new HTTP requests
        await new Promise<void>((resolve, reject) => {
            server.close((err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        logger.info("HTTP server closed");

        // Close database
        await prisma.$disconnect();
        logger.info("Prisma disconnected");

        // Close Redis
        await redis.quit();
        logger.info("Redis disconnected");

        // Close RabbitMQ
        await rabbitMQ.disconnect();
        logger.info("RabbitMQ disconnected");

        logger.info("Graceful shutdown completed");

        process.exit(0);

    } catch (error) {

        logger.error(error, "Shutdown failed");

        process.exit(1);
    }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();