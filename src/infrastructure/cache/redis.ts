import IORedis from "ioredis";
import { env } from "../../core/config/env.js";

const RedisCtor: any = (IORedis as any).default ?? IORedis;

export const redis = new RedisCtor(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false
});
