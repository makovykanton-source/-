import { Worker } from "bullmq";
import { logger } from "../core/logging/logger.js";
import { ModerationProcessor } from "./processors/moderation.processor.js";
import { BackupProcessor } from "./processors/backup.processor.js";
import { AnalyticsProcessor } from "./processors/analytics.processor.js";
import { bullmqConnection } from "../infrastructure/queue/connection.js";

const moderation = new ModerationProcessor();
const backup = new BackupProcessor();
const analytics = new AnalyticsProcessor();

new Worker("moderation-actions", async (job) => moderation.handle(job), { connection: bullmqConnection, concurrency: 20 });
new Worker("backup-jobs", async (job) => backup.handle(job), { connection: bullmqConnection, concurrency: 5 });
new Worker("analytics-events", async (job) => analytics.handle(job), { connection: bullmqConnection, concurrency: 25 });

logger.info("Workers started");
