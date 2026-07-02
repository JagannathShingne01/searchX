import { redis } from "../config/redis";

const SEARCH_VERSION_KEY = "search:version";

export async function getSearchVersion() {
  const version = await redis.get(SEARCH_VERSION_KEY);
  return version ?? "1";
}

export async function incrementSearchVersion() {
  return redis.incr(SEARCH_VERSION_KEY);
}