import { Job } from "bullmq";
import { logger } from "../../core/logging/logger.js";

export interface ModerationJobPayload {
  guildId: string;
  userId: string;
  action: "BAN" | "KICK" | "MUTE" | "STRIP_ROLES";
  reason: string;
  correlationId?: string;
}

export class ModerationProcessor {
  async handle(job: Job<ModerationJobPayload>): Promise<void> {
    logger.warn({
      jobId: job.id,
      guildId: job.data.guildId,
      userId: job.data.userId,
      action: job.data.action,
      correlationId: job.data.correlationId
    }, "Processing moderation action");

    // Idempotency and external action calls are intentionally isolated here.
    // In production, this should call DiscordModerationAdapter with retries + backoff.
  }
}
