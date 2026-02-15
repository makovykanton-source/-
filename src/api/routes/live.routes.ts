import { FastifyInstance } from "fastify";
import { requireGuildAdmin } from "../middleware/require-guild-admin.js";
import { LogStreamGateway } from "../../infrastructure/websocket/log-stream.gateway.js";

let gateway: LogStreamGateway | null = null;

export function registerGateway(instance: LogStreamGateway): void {
  gateway = instance;
}

export async function registerLiveRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/v1/guilds/:guildId/live/test-event", { preHandler: [requireGuildAdmin] }, async (req) => {
    const { guildId } = req.params as { guildId: string };
    const body = (req.body ?? {}) as { summary?: string; severity?: string; threatType?: string };

    gateway?.publish({
      guildId,
      threatType: body.threatType ?? "ANOMALY",
      severity: body.severity ?? "LOW",
      summary: body.summary ?? "manual test event",
      ts: new Date().toISOString()
    });

    return { ok: true };
  });
}
