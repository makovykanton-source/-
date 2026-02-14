import { PolicyRepository } from "../../domain/repositories/policy.repository.js";
import { DefaultPolicy, GuildSecurityPolicy } from "../../domain/entities/guild-security-policy.js";
import { pgPool } from "../db/postgres.js";

export class PgPolicyRepository implements PolicyRepository {
  async findByGuildId(guildId: string): Promise<GuildSecurityPolicy | null> {
    const r = await pgPool.query("SELECT * FROM guild_security_configs WHERE guild_id = $1 LIMIT 1", [guildId]);
    if (!r.rowCount) return null;
    const row = r.rows[0];

    return {
      guildId,
      modules: {
        antiNuke: row.anti_nuke_enabled,
        antiRaid: row.anti_raid_enabled,
        antiSpam: row.anti_spam_enabled,
        antiLink: row.anti_link_enabled,
        antiWebhook: row.anti_webhook_enabled,
        roleIntegrity: row.role_escalation_protection,
        permissionIntegrity: row.permission_integrity_monitor,
        anomalyDetection: true,
        backupRecovery: true
      },
      thresholds: {
        channelDeletePerWindow: 3,
        roleDeletePerWindow: 2,
        joinBurstPer15s: row.raid_join_threshold,
        messageRatePer10s: row.message_rate_per_10s,
        webhookCreatePer10s: row.webhook_create_threshold,
        anomalyScore: 40,
        lockdownThreatsPerMinute: 10
      },
      response: DefaultPolicy.response,
      updatedAt: new Date(row.updated_at)
    };
  }

  async save(policy: GuildSecurityPolicy): Promise<void> {
    await pgPool.query(
      `INSERT INTO guild_security_configs (
      guild_id, anti_nuke_enabled, anti_raid_enabled, anti_spam_enabled, anti_link_enabled,
      anti_webhook_enabled, role_escalation_protection, permission_integrity_monitor,
      auto_lockdown_enabled, raid_join_threshold, message_rate_per_10s, webhook_create_threshold, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now())
      ON CONFLICT (guild_id) DO UPDATE SET
      anti_nuke_enabled=$2, anti_raid_enabled=$3, anti_spam_enabled=$4, anti_link_enabled=$5,
      anti_webhook_enabled=$6, role_escalation_protection=$7, permission_integrity_monitor=$8,
      auto_lockdown_enabled=$9, raid_join_threshold=$10, message_rate_per_10s=$11,
      webhook_create_threshold=$12, updated_at=now()`,
      [
        policy.guildId,
        policy.modules.antiNuke,
        policy.modules.antiRaid,
        policy.modules.antiSpam,
        policy.modules.antiLink,
        policy.modules.antiWebhook,
        policy.modules.roleIntegrity,
        policy.modules.permissionIntegrity,
        true,
        policy.thresholds.joinBurstPer15s,
        policy.thresholds.messageRatePer10s,
        policy.thresholds.webhookCreatePer10s
      ]
    );
  }
}
