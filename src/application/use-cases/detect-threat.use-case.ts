import { v4 as uuid } from "uuid";
import { SecurityEvent } from "../../domain/entities/security-event.js";
import { SecurityEventRepository } from "../../domain/repositories/security-event.repository.js";
import { AuditLogRepository } from "../../domain/repositories/audit-log.repository.js";
import { EventBus } from "../../domain/events/event-bus.js";

export interface DetectThreatInput {
  guildId: string;
  actorId?: string;
  targetId?: string;
  threatType: SecurityEvent["threatType"];
  severity: SecurityEvent["severity"];
  summary: string;
  payload: Record<string, unknown>;
}

export class DetectThreatUseCase {
  constructor(
    private readonly events: SecurityEventRepository,
    private readonly audit: AuditLogRepository,
    private readonly bus: EventBus
  ) {}

  async execute(input: DetectThreatInput): Promise<SecurityEvent> {
    const event: SecurityEvent = {
      id: uuid(),
      guildId: input.guildId,
      actorId: input.actorId,
      targetId: input.targetId,
      threatType: input.threatType,
      severity: input.severity,
      payload: {
        ...input.payload,
        summary: input.summary
      },
      createdAt: new Date()
    };

    await this.events.save(event);

    await this.audit.append({
      id: uuid(),
      guildId: input.guildId,
      actorId: input.actorId,
      action: `THREAT_${input.threatType}`,
      resourceType: "SECURITY_EVENT",
      resourceId: event.id,
      metadata: {
        severity: input.severity,
        summary: input.summary,
        payload: input.payload
      },
      createdAt: new Date()
    });

    await this.bus.publish("security.threat.detected", {
      eventId: event.id,
      guildId: input.guildId,
      threatType: input.threatType,
      severity: input.severity,
      ts: event.createdAt.toISOString()
    });

    return event;
  }
}
