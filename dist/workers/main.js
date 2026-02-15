import { Worker } from "bullmq";
import { redis } from "../infrastructure/cache/redis.js";
import { logger } from "../core/logging/logger.js";
new Worker("moderation-actions", async (job) => {
    logger.warn({ jobId: job.id, payload: job.data }, "Executing moderation action");
    // TODO: call discord moderation adapter with idempotency key and audit trail.
}, { connection: redis, concurrency: 20 });
new Worker("backup-jobs", async (job) => {
    logger.info({ jobId: job.id }, "Executing backup job");
}, { connection: redis, concurrency: 5 });
logger.info("Workers started");
