import { pgPool } from "../../infrastructure/db/postgres.js";
import { requireGuildAdmin } from "../middleware/require-guild-admin.js";
export async function registerWhitelistRoutes(app) {
    app.get("/api/v1/guilds/:guildId/whitelist", { preHandler: [requireGuildAdmin] }, async (req) => {
        const { guildId } = req.params;
        const result = await pgPool.query("SELECT user_id, trust_score FROM guild_user_roles WHERE guild_id=$1 AND is_whitelisted=true", [guildId]);
        return { items: result.rows };
    });
}
