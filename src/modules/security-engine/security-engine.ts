import { EventBus } from "../../domain/events/event-bus.js";
import { ProcessMessageSecurityUseCase } from "../../application/use-cases/process-message-security.use-case.js";
import { ProcessMemberJoinUseCase } from "../../application/use-cases/process-member-join.use-case.js";
import { ProcessWebhookSecurityUseCase } from "../../application/use-cases/process-webhook-security.use-case.js";
import { SecurityActionsService } from "../../infrastructure/discord/security-actions.service.js";
import { DetectThreatUseCase } from "../../application/use-cases/detect-threat.use-case.js";
import { decideLockdown } from "../lockdown/lockdown.service.js";

export interface SecurityEngineDependencies {
  eventBus: EventBus;
  processMessage: ProcessMessageSecurityUseCase;
  processJoin: ProcessMemberJoinUseCase;
  processWebhook: ProcessWebhookSecurityUseCase;
  actions: SecurityActionsService;
  detectThreat: DetectThreatUseCase;
}

export class SecurityEngine {
  constructor(private readonly deps: SecurityEngineDependencies) {}

  wire(): void {
    this.deps.eventBus.subscribe("discord.message.created", async (payload: unknown) => {
      const p = payload as {
        guildId: string;
        channelId: string;
        messageId: string;
        userId: string;
        content: string;
        ts: number;
        maxRatePer10s: number;
      };

      const decision = await this.deps.processMessage.execute({
        guildId: p.guildId,
        channelId: p.channelId,
        messageId: p.messageId,
        userId: p.userId,
        content: p.content,
        ts: p.ts,
        maxRatePer10s: p.maxRatePer10s
      });

      if (decision.shouldDelete || decision.shouldTimeout) {
        await this.deps.actions.enforceMessageDecision(
          p.guildId,
          p.channelId,
          p.messageId,
          p.userId,
          decision.shouldDelete,
          decision.shouldTimeout,
          decision.reasons.join(",")
        );
      }
    });

    this.deps.eventBus.subscribe("discord.member.joined", async (payload: unknown) => {
      const p = payload as {
        guildId: string;
        userId: string;
        accountAgeDays: number;
        punishmentHistory: number;
        suspiciousActions24h: number;
        sharedIpRisk: number;
        isWhitelisted: boolean;
        ts: number;
        raidThreshold: number;
      };

      const decision = await this.deps.processJoin.execute({
        guildId: p.guildId,
        userId: p.userId,
        accountAgeDays: p.accountAgeDays,
        punishmentHistory: p.punishmentHistory,
        suspiciousActions24h: p.suspiciousActions24h,
        sharedIpRisk: p.sharedIpRisk,
        isWhitelisted: p.isWhitelisted,
        ts: p.ts,
        raidThreshold: p.raidThreshold
      });

      await this.deps.actions.enforceJoinDecision(
        p.guildId,
        p.userId,
        decision.shouldKick,
        decision.shouldRequireVerification,
        decision.reasons.join(",")
      );
    });

    this.deps.eventBus.subscribe("discord.webhook.created", async (payload: unknown) => {
      const p = payload as {
        guildId: string;
        actorId?: string;
        webhookId: string;
        ts: number;
        threshold?: number;
      };

      const decision = await this.deps.processWebhook.execute({
        guildId: p.guildId,
        actorId: p.actorId,
        webhookId: p.webhookId,
        ts: p.ts,
        threshold: p.threshold
      });

      if (decision.shouldDeleteWebhook) {
        await this.deps.detectThreat.execute({
          guildId: p.guildId,
          actorId: p.actorId,
          threatType: "ANTI_WEBHOOK",
          severity: "CRITICAL",
          summary: "Webhook removed by policy",
          payload: {
            webhookId: p.webhookId,
            shouldBanActor: decision.shouldBanActor
          }
        });
      }
    });

    this.deps.eventBus.subscribe("security.threat.window", async (payload: unknown) => {
      const p = payload as { guildId: string; threatsLastMinute: number };
      const decision = decideLockdown(p.threatsLastMinute);

      if (decision.shouldLockdown) {
        await this.deps.actions.autoLockdown(p.guildId, decision.reason);
        await this.deps.detectThreat.execute({
          guildId: p.guildId,
          threatType: "ANOMALY",
          severity: "CRITICAL",
          summary: "Automatic lockdown engaged",
          payload: {
            threatsLastMinute: p.threatsLastMinute,
            reason: decision.reason
          }
        });
      }
    });
  }
}
