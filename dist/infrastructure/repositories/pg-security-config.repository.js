import { pgPool } from "../db/postgres.js";
export class PgSecurityConfigRepository {
    async findByGuildId(guildId) {
        const result = await pgPool.query("SELECT * FROM guild_security_configs WHERE guild_id=$1 LIMIT 1", [guildId]);
        if (!result.rowCount)
            return null;
        const row = result.rows[0];
        return {
            guildId: row.guild_id,
            antiNukeEnabled: row.anti_nuke_enabled,
            antiRaidEnabled: row.anti_raid_enabled,
            antiSpamEnabled: row.anti_spam_enabled,
            antiLinkEnabled: row.anti_link_enabled,
            antiWebhookEnabled: row.anti_webhook_enabled,
            autoLockdownEnabled: row.auto_lockdown_enabled,
            raidJoinThreshold: row.raid_join_threshold,
            messageRatePer10s: row.message_rate_per_10s
        };
    }
    async upsert(config) {
        await pgPool.query(`INSERT INTO guild_security_configs
       (guild_id, anti_nuke_enabled, anti_raid_enabled, anti_spam_enabled, anti_link_enabled,
        anti_webhook_enabled, auto_lockdown_enabled, raid_join_threshold, message_rate_per_10s, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
       ON CONFLICT (guild_id) DO UPDATE SET
        anti_nuke_enabled=$2, anti_raid_enabled=$3, anti_spam_enabled=$4, anti_link_enabled=$5,
        anti_webhook_enabled=$6, auto_lockdown_enabled=$7, raid_join_threshold=$8,
        message_rate_per_10s=$9, updated_at=now()`, [
            config.guildId,
            config.antiNukeEnabled,
            config.antiRaidEnabled,
            config.antiSpamEnabled,
            config.antiLinkEnabled,
            config.antiWebhookEnabled,
            config.autoLockdownEnabled,
            config.raidJoinThreshold,
            config.messageRatePer10s
        ]);
    }
}
