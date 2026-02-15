import { FastifyInstance } from "fastify";
import { pgPool } from "../../infrastructure/db/postgres.js";
import { requireGuildAdmin } from "../middleware/require-guild-admin.js";

export async function registerLogRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/guilds/:guildId/events", { preHandler: [requireGuildAdmin] }, async (req) => {
    const { guildId } = req.params as { guildId: string };
    const result = await pgPool.query(
      "SELECT id, threat_type, severity, summary, created_at FROM security_events WHERE guild_id=$1 ORDER BY created_at DESC LIMIT 100",
      [guildId]
    );
    return { items: result.rows };
  });
}
