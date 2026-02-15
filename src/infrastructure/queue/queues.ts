import { Queue } from "bullmq";
import { bullmqConnection } from "./connection.js";

export const moderationQueue = new Queue("moderation-actions", { connection: bullmqConnection });
export const backupQueue = new Queue("backup-jobs", { connection: bullmqConnection });
export const analyticsQueue = new Queue("analytics-events", { connection: bullmqConnection });
