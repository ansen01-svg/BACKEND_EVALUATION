import * as dotenv from "dotenv";
import { createClient, RedisClientType } from "redis";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
let redisClient: RedisClientType;

export async function connectRedis(): Promise<RedisClientType> {
  redisClient = createClient({ url: REDIS_URL });

  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });

  try {
    await redisClient.connect();
    console.log("✓ Redis connected");
  } catch (error) {
    console.warn(
      "⚠ Redis connection failed — rate limiting will use in-memory fallback",
    );
  }

  return redisClient;
}

export function getRedisClient(): RedisClientType {
  return redisClient;
}
