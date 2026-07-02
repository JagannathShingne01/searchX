import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

export async function initializeRedis() {
  try {
    await redis.connect();

    console.log("✅ Redis Connected");
  } catch (error) {
    console.error("Redis Connection Failed");
    console.error(error);
    process.exit(1);
  }
}