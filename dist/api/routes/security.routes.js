import { z } from "zod";
import { pgPool } from "../../infrastructure/db/postgres.js";
import { requireGuildAdmin } from "../middleware/require-guild-admin.js";
const SecurityConfigSchema = z.object({
    antiNukeEnabled: z.boolean(),
    antiRaidEnabled: z.boolean(),
    antiSpamEnabled: z.boolean(),
    antiLinkEnabled: z.boolean(),
    antiWebhookEnabled: z.boolean(),
    autoLockdownEnabled: z.boolean(),
    raidJoinThreshold: z.number().int().min(2).max(100),
    messageRatePer10s: z.number().int().min(2).max(50)
});
export async function registerSecurityRoutes(app) {
    app.get("/api/v1/guilds/:guildId/security/config", { preHandler: [requireGuildAdmin] }, async (req, reply) => {
        const { guildId } = req.params;
        const result = await pgPool.query("SELECT * FROM guild_security_configs WHERE guild_id = $1", [guildId]);
        if (!result.rowCount)
            return reply.code(404).send({ error: "Config not found" });
        return reply.send(result.rows[0]);
    });
    app.put("/api/v1/guilds/:guildId/security/config", { preHandler: [requireGuildAdmin] }, async (req, reply) => {
        const { guildId } = req.params;
        const payload = SecurityConfigSchema.parse(req.body);
        await pgPool.query(`
      INSERT INTO guild_security_configs (
        guild_id, anti_nuke_enabled, anti_raid_enabled, anti_spam_enabled, anti_link_enabled,
        anti_webhook_enabled, auto_lockdown_enabled, raid_join_threshold, message_rate_per_10s, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
      ON CONFLICT (guild_id)
      DO UPDATE SET
        anti_nuke_enabled = EXCLUDED.anti_nuke_enabled,
        anti_raid_enabled = EXCLUDED.anti_raid_enabled,
        anti_spam_enabled = EXCLUDED.anti_spam_enabled,
        anti_link_enabled = EXCLUDED.anti_link_enabled,
        anti_webhook_enabled = EXCLUDED.anti_webhook_enabled,
        auto_lockdown_enabled = EXCLUDED.auto_lockdown_enabled,
        raid_join_threshold = EXCLUDED.raid_join_threshold,
        message_rate_per_10s = EXCLUDED.message_rate_per_10s,
        updated_at = now()
      `, [
            guildId,
            payload.antiNukeEnabled,
            payload.antiRaidEnabled,
            payload.antiSpamEnabled,
            payload.antiLinkEnabled,
            payload.antiWebhookEnabled,
            payload.autoLockdownEnabled,
            payload.raidJoinThreshold,
            payload.messageRatePer10s
        ]);
        return reply.code(204).send();
    });
}
