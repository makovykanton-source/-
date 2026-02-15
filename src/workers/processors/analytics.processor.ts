import { Job } from "bullmq";
import { logger } from "../../core/logging/logger.js";

export interface AnalyticsJobPayload {
  guildId: string;
  type: string;
  data: Record<string, unknown>;
  ts: string;
}

export class AnalyticsProcessor {
  async handle(job: Job<AnalyticsJobPayload>): Promise<void> {
    logger.debug({
      jobId: job.id,
      guildId: job.data.guildId,
      type: job.data.type,
      ts: job.data.ts
    }, "Processing analytics event");
  }
}
