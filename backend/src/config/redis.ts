import { createClient } from "redis";
import { logger } from "./logger";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

export async function initializeRedis() {
  try {
    await redis.connect();

    logger.info("✅ Redis Connected");
  } catch (error) {
    logger.error({
      error: error,
    }, "Redis connection failed");
    process.exit(1);
  }
}