import { EventBus } from "../../domain/events/event-bus.js";
import { DetectThreatUseCase } from "./detect-threat.use-case.js";
import { ProcessMessageSecurityUseCase } from "./process-message-security.use-case.js";
import { ProcessMemberJoinUseCase } from "./process-member-join.use-case.js";
import { ProcessWebhookSecurityUseCase } from "./process-webhook-security.use-case.js";

export interface MessageEnvelope {
  guildId: string;
  channelId: string;
  messageId: string;
  userId: string;
  content: string;
  ts: number;
}

export interface JoinEnvelope {
  guildId: string;
  userId: string;
  accountAgeDays: number;
  punishmentHistory: number;
  suspiciousActions24h: number;
  sharedIpRisk: number;
  isWhitelisted: boolean;
  ts: number;
}

export interface WebhookEnvelope {
  guildId: string;
  actorId?: string;
  webhookId: string;
  ts: number;
}

export interface SecurityOrchestrationConfig {
  messageRatePer10s: number;
  raidJoinThreshold: number;
  webhookCreateThreshold: number;
}

export class SecurityOrchestrationUseCase {
  constructor(
    private readonly bus: EventBus,
    private readonly detectThreat: DetectThreatUseCase,
    private readonly processMessage: ProcessMessageSecurityUseCase,
    private readonly processJoin: ProcessMemberJoinUseCase,
    private readonly processWebhook: ProcessWebhookSecurityUseCase
  ) {}

  async onMessageCreated(config: SecurityOrchestrationConfig, message: MessageEnvelope): Promise<void> {
    if (!this.validateMessage(message)) {
      await this.detectThreat.execute({
        guildId: message.guildId,
        actorId: message.userId,
        threatType: "ANOMALY",
        severity: "LOW",
        summary: "Malformed message event envelope",
        payload: { messageId: message.messageId }
      });
      return;
    }

    const normalized = this.normalizeMessage(message);

    const decision = await this.processMessage.execute({
      guildId: normalized.guildId,
      channelId: normalized.channelId,
      messageId: normalized.messageId,
      userId: normalized.userId,
      content: normalized.content,
      ts: normalized.ts,
      maxRatePer10s: config.messageRatePer10s
    });

    await this.bus.publish("security.message.decision", {
      guildId: normalized.guildId,
      userId: normalized.userId,
      messageId: normalized.messageId,
      shouldDelete: decision.shouldDelete,
      shouldTimeout: decision.shouldTimeout,
      reasons: decision.reasons,
      ts: new Date().toISOString()
    });

    if (decision.reasons.length > 0) {
      await this.bus.publish("security.audit.log", {
        guildId: normalized.guildId,
        actorId: normalized.userId,
        action: "MESSAGE_SECURITY_DECISION",
        metadata: {
          messageId: normalized.messageId,
          reasons: decision.reasons
        }
      });
    }
  }

  async onMemberJoined(config: SecurityOrchestrationConfig, join: JoinEnvelope): Promise<void> {
    const decision = await this.processJoin.execute({
      guildId: join.guildId,
      userId: join.userId,
      accountAgeDays: join.accountAgeDays,
      punishmentHistory: join.punishmentHistory,
      suspiciousActions24h: join.suspiciousActions24h,
      sharedIpRisk: join.sharedIpRisk,
      isWhitelisted: join.isWhitelisted,
      ts: join.ts,
      raidThreshold: config.raidJoinThreshold
    });

    await this.bus.publish("security.join.decision", {
      guildId: join.guildId,
      userId: join.userId,
      shouldKick: decision.shouldKick,
      shouldRequireVerification: decision.shouldRequireVerification,
      trustScore: decision.trustScore,
      riskBand: decision.riskBand,
      reasons: decision.reasons
    });

    if (decision.shouldRequireVerification) {
      await this.bus.publish("security.risk.user", {
        guildId: join.guildId,
        userId: join.userId,
        trustScore: decision.trustScore,
        riskBand: decision.riskBand,
        reasons: decision.reasons
      });
    }
  }

  async onWebhookCreated(config: SecurityOrchestrationConfig, webhook: WebhookEnvelope): Promise<void> {
    const decision = await this.processWebhook.execute({
      guildId: webhook.guildId,
      actorId: webhook.actorId,
      webhookId: webhook.webhookId,
      ts: webhook.ts,
      threshold: config.webhookCreateThreshold
    });

    await this.bus.publish("security.webhook.decision", {
      guildId: webhook.guildId,
      webhookId: webhook.webhookId,
      shouldDeleteWebhook: decision.shouldDeleteWebhook,
      shouldBanActor: decision.shouldBanActor,
      reason: decision.reason
    });
  }

  private validateMessage(message: MessageEnvelope): boolean {
    if (!message.guildId || !message.channelId || !message.messageId || !message.userId) return false;
    if (typeof message.content !== "string") return false;
    if (!Number.isFinite(message.ts) || message.ts <= 0) return false;
    return true;
  }

  private normalizeMessage(message: MessageEnvelope): MessageEnvelope {
    return {
      ...message,
      content: message.content.trim().replace(/\s+/g, " ")
    };
  }

  buildDefaultConfig(): SecurityOrchestrationConfig {
    return {
      messageRatePer10s: 7,
      raidJoinThreshold: 8,
      webhookCreateThreshold: 3
    };
  }

  mergeConfig(base: SecurityOrchestrationConfig, overrides?: Partial<SecurityOrchestrationConfig>): SecurityOrchestrationConfig {
    return {
      messageRatePer10s: overrides?.messageRatePer10s ?? base.messageRatePer10s,
      raidJoinThreshold: overrides?.raidJoinThreshold ?? base.raidJoinThreshold,
      webhookCreateThreshold: overrides?.webhookCreateThreshold ?? base.webhookCreateThreshold
    };
  }

  async simulateThreatStorm(guildId: string, actorId: string): Promise<void> {
    const samples = [
      { threatType: "ANTI_SPAM", severity: "MEDIUM", summary: "spam sample" },
      { threatType: "ANTI_LINK", severity: "HIGH", summary: "link sample" },
      { threatType: "ANTI_WEBHOOK", severity: "CRITICAL", summary: "webhook sample" },
      { threatType: "ANOMALY", severity: "LOW", summary: "anomaly sample" }
    ] as const;

    for (const s of samples) {
      await this.detectThreat.execute({
        guildId,
        actorId,
        threatType: s.threatType,
        severity: s.severity,
        summary: s.summary,
        payload: {
          simulation: true,
          scenario: s.summary
        }
      });
    }
  }

  async emitOperationalHeartbeat(guildId: string): Promise<void> {
    await this.bus.publish("security.heartbeat", {
      guildId,
      ts: new Date().toISOString(),
      source: "security_orchestration"
    });
  }

  async handleBulkMessages(config: SecurityOrchestrationConfig, batch: MessageEnvelope[]): Promise<void> {
    for (const msg of batch) {
      await this.onMessageCreated(config, msg);
    }
  }

  async handleBulkJoins(config: SecurityOrchestrationConfig, batch: JoinEnvelope[]): Promise<void> {
    for (const join of batch) {
      await this.onMemberJoined(config, join);
    }
  }

  async handleBulkWebhooks(config: SecurityOrchestrationConfig, batch: WebhookEnvelope[]): Promise<void> {
    for (const hook of batch) {
      await this.onWebhookCreated(config, hook);
    }
  }

  deriveDynamicRateLimit(activeThreats: number): number {
    if (activeThreats <= 5) return 7;
    if (activeThreats <= 15) return 5;
    if (activeThreats <= 30) return 4;
    return 3;
  }

  deriveDynamicJoinThreshold(activeThreats: number): number {
    if (activeThreats <= 5) return 10;
    if (activeThreats <= 15) return 8;
    if (activeThreats <= 30) return 6;
    return 4;
  }

  deriveDynamicWebhookThreshold(activeThreats: number): number {
    if (activeThreats <= 5) return 4;
    if (activeThreats <= 15) return 3;
    return 2;
  }
}
