import { createApiServer } from "./api/server.js";
import { env } from "./core/config/env.js";
import { logger } from "./core/logging/logger.js";
import { LogStreamGateway } from "./infrastructure/websocket/log-stream.gateway.js";
import { registerGateway } from "./api/routes/live.routes.js";

async function bootstrap(): Promise<void> {
  const app = await createApiServer();
  const ws = new LogStreamGateway(env.PORT + 1);
  registerGateway(ws);

  setInterval(() => {
    ws.publish({
      guildId: "demo",
      threatType: "ANTI_SPAM",
      severity: "LOW",
      summary: "Heartbeat threat sample",
      ts: new Date().toISOString()
    });
  }, 15_000);

  await app.listen({ port: env.PORT, host: env.API_HOST });
  logger.info({ port: env.PORT }, "API started");
}

bootstrap().catch((err) => {
  logger.error(err, "Fatal bootstrap error");
  process.exit(1);
});
