import { AuditLogEntry, AuditLogRepository } from "../../domain/repositories/audit-log.repository.js";
import { pgPool } from "../db/postgres.js";

export class PgAuditLogRepository implements AuditLogRepository {
  async append(entry: AuditLogEntry): Promise<void> {
    await pgPool.query(
      `INSERT INTO audit_logs
      (id, guild_id, user_id, action, resource_type, resource_id, metadata, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        entry.id,
        entry.guildId,
        entry.actorId ?? null,
        entry.action,
        entry.resourceType ?? null,
        entry.resourceId ?? null,
        JSON.stringify(entry.metadata),
        entry.createdAt
      ]
    );
  }

  async latest(guildId: string, limit: number): Promise<AuditLogEntry[]> {
    const result = await pgPool.query(
      `SELECT id, guild_id, user_id, action, resource_type, resource_id, metadata, created_at
       FROM audit_logs
       WHERE guild_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [guildId, limit]
    );

    return result.rows.map((r) => ({
      id: r.id,
      guildId: r.guild_id,
      actorId: r.user_id ?? undefined,
      action: r.action,
      resourceType: r.resource_type ?? undefined,
      resourceId: r.resource_id ?? undefined,
      metadata: r.metadata,
      createdAt: new Date(r.created_at)
    }));
  }
}
