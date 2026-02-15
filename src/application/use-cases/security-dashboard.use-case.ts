import { SecurityEventRepository } from "../../domain/repositories/security-event.repository.js";
import { AuditLogRepository } from "../../domain/repositories/audit-log.repository.js";

export interface DashboardOverview {
  threatsLast24h: number;
  criticalThreatsLast24h: number;
  blockedThreatsLast24h: number;
  recentThreats: Array<{
    id: string;
    threatType: string;
    severity: string;
    createdAt: string;
  }>;
  recentAuditActions: Array<{
    id: string;
    action: string;
    createdAt: string;
  }>;
}

export class SecurityDashboardUseCase {
  constructor(
    private readonly events: SecurityEventRepository,
    private readonly audit: AuditLogRepository
  ) {}

  async execute(guildId: string): Promise<DashboardOverview> {
    const [threats, audit] = await Promise.all([
      this.events.latestByGuild(guildId, 300),
      this.audit.latest(guildId, 100)
    ]);

    const now = Date.now();
    const dayThreats = threats.filter((t) => now - t.createdAt.getTime() <= 24 * 60 * 60 * 1000);

    return {
      threatsLast24h: dayThreats.length,
      criticalThreatsLast24h: dayThreats.filter((x) => x.severity === "CRITICAL").length,
      blockedThreatsLast24h: dayThreats.length,
      recentThreats: threats.slice(0, 20).map((x) => ({
        id: x.id,
        threatType: x.threatType,
        severity: x.severity,
        createdAt: x.createdAt.toISOString()
      })),
      recentAuditActions: audit.slice(0, 20).map((x) => ({
        id: x.id,
        action: x.action,
        createdAt: x.createdAt.toISOString()
      }))
    };
  }
}
