import { Queue } from "bullmq";
import { redis } from "../cache/redis.js";
export const moderationQueue = new Queue("moderation-actions", { connection: redis });
export const backupQueue = new Queue("backup-jobs", { connection: redis });
export const analyticsQueue = new Queue("analytics-events", { connection: redis });
