import { webhookBurstDetected } from "../../modules/anti-webhook/anti-webhook.handler.js";
import { DetectThreatUseCase } from "./detect-threat.use-case.js";

export interface WebhookSecurityInput {
  guildId: string;
  actorId?: string;
  webhookId: string;
  ts: number;
  threshold?: number;
}

export interface WebhookSecurityDecision {
  shouldDeleteWebhook: boolean;
  shouldBanActor: boolean;
  reason?: string;
}

export class ProcessWebhookSecurityUseCase {
  constructor(private readonly detectThreat: DetectThreatUseCase) {}

  async execute(input: WebhookSecurityInput): Promise<WebhookSecurityDecision> {
    const detected = webhookBurstDetected(input.guildId, input.ts, input.threshold ?? 3);

    if (!detected) {
      return { shouldDeleteWebhook: false, shouldBanActor: false };
    }

    await this.detectThreat.execute({
      guildId: input.guildId,
      actorId: input.actorId,
      threatType: "ANTI_WEBHOOK",
      severity: "CRITICAL",
      summary: "Webhook burst threshold exceeded",
      payload: {
        webhookId: input.webhookId,
        threshold: input.threshold ?? 3,
        ts: input.ts
      }
    });

    return {
      shouldDeleteWebhook: true,
      shouldBanActor: Boolean(input.actorId),
      reason: "webhook_burst_detected"
    };
  }
}
