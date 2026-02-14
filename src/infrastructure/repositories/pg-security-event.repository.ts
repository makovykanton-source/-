import { SecurityEventRepository } from "../../domain/repositories/security-event.repository.js";
import { SecurityEvent } from "../../domain/entities/security-event.js";
import { pgPool } from "../db/postgres.js";

export class PgSecurityEventRepository implements SecurityEventRepository {
  async save(event: SecurityEvent): Promise<void> {
    const summary = typeof event.payload.summary === "string" ? event.payload.summary : event.threatType;

    await pgPool.query(
      `INSERT INTO security_events
      (id, guild_id, actor_id, target_id, threat_type, severity, blocked, summary, payload, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        event.id,
        event.guildId,
        event.actorId ?? null,
        event.targetId ?? null,
        event.threatType,
        event.severity,
        true,
        summary,
        JSON.stringify(event.payload),
        event.createdAt
      ]
    );
  }

  async latestByGuild(guildId: string, limit: number): Promise<SecurityEvent[]> {
    const result = await pgPool.query(
      `SELECT id, guild_id, actor_id, target_id, threat_type, severity, payload, created_at
      FROM security_events
      WHERE guild_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
      [guildId, limit]
    );

    return result.rows.map((r) => ({
      id: r.id,
      guildId: r.guild_id,
      actorId: r.actor_id ?? undefined,
      targetId: r.target_id ?? undefined,
      threatType: r.threat_type,
      severity: r.severity,
      payload: r.payload,
      createdAt: new Date(r.created_at)
    }));
  }
}
