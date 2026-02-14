import { Worker } from "bullmq";
import { redis } from "../infrastructure/cache/redis.js";
import { logger } from "../core/logging/logger.js";
import { ModerationProcessor } from "./processors/moderation.processor.js";
import { BackupProcessor } from "./processors/backup.processor.js";
import { AnalyticsProcessor } from "./processors/analytics.processor.js";

const moderation = new ModerationProcessor();
const backup = new BackupProcessor();
const analytics = new AnalyticsProcessor();

new Worker("moderation-actions", async (job) => moderation.handle(job), { connection: redis, concurrency: 20 });
new Worker("backup-jobs", async (job) => backup.handle(job), { connection: redis, concurrency: 5 });
new Worker("analytics-events", async (job) => analytics.handle(job), { connection: redis, concurrency: 25 });

logger.info("Workers started");
