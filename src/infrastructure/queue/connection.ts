import { env } from "../../core/config/env.js";

export const bullmqConnection = {
  url: env.REDIS_URL
};
