import { EventBus } from "../../domain/events/event-bus.js";
import { TrustScoreService } from "../../modules/trust-score/trust-score.service.js";
import { PgSecurityEventRepository } from "../../infrastructure/repositories/pg-security-event.repository.js";
import { PgAuditLogRepository } from "../../infrastructure/repositories/pg-audit-log.repository.js";
import { DetectThreatUseCase } from "../../application/use-cases/detect-threat.use-case.js";
import { ProcessMessageSecurityUseCase } from "../../application/use-cases/process-message-security.use-case.js";
import { ProcessMemberJoinUseCase } from "../../application/use-cases/process-member-join.use-case.js";
import { ProcessWebhookSecurityUseCase } from "../../application/use-cases/process-webhook-security.use-case.js";

export function buildSecurityRuntime(): {
  bus: EventBus;
  detectThreat: DetectThreatUseCase;
  processMessage: ProcessMessageSecurityUseCase;
  processJoin: ProcessMemberJoinUseCase;
  processWebhook: ProcessWebhookSecurityUseCase;
} {
  const bus = new EventBus();
  const eventRepo = new PgSecurityEventRepository();
  const auditRepo = new PgAuditLogRepository();
  const detectThreat = new DetectThreatUseCase(eventRepo, auditRepo, bus);
  const trust = new TrustScoreService();

  return {
    bus,
    detectThreat,
    processMessage: new ProcessMessageSecurityUseCase(detectThreat),
    processJoin: new ProcessMemberJoinUseCase(trust, detectThreat),
    processWebhook: new ProcessWebhookSecurityUseCase(detectThreat)
  };
}
