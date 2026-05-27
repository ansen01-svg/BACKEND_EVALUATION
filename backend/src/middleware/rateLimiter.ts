import { NextFunction, Response } from "express";
import {
  RateLimiterAbstract,
  RateLimiterMemory,
  RateLimiterRedis,
} from "rate-limiter-flexible";
import { getRedisClient } from "../config/redis";
import { AuthRequest } from "../types";
import { USER_ROLES } from "../utils/constants";

let partnerLimiter: RateLimiterAbstract;
let internalLimiter: RateLimiterAbstract;

export function initRateLimiters(): void {
  const redisClient = getRedisClient();

  const RateLimiterClass = redisClient?.isReady
    ? RateLimiterRedis
    : RateLimiterMemory;
  const storeOpts = redisClient?.isReady ? { storeClient: redisClient } : {};

  // Partners: 100 requests per minute
  partnerLimiter = new RateLimiterClass({
    ...storeOpts,
    keyPrefix: "rl_partner",
    points: 100,
    duration: 60,
  } as any);

  // Internal: 1000 requests per minute
  internalLimiter = new RateLimiterClass({
    ...storeOpts,
    keyPrefix: "rl_internal",
    points: 1000,
    duration: 60,
  } as any);

  console.log(
    `✓ Rate limiters initialized (${redisClient?.isReady ? "Redis" : "in-memory"})`,
  );
}

export async function rateLimiter(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const user = req.user;
  if (!user) {
    next();
    return;
  }

  const limiter =
    user.role_id === USER_ROLES.PARTNER ? partnerLimiter : internalLimiter;
  const key = user.userId;

  try {
    await limiter.consume(key);
    next();
  } catch {
    res.status(429).json({
      error: "Too many requests",
      message: `Rate limit exceeded. Please try again later.`,
    });
  }
}
