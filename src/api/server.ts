import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { env } from "../core/config/env.js";
import { tokens } from "../core/config/tokens.js";
import { registerSecurityRoutes } from "./routes/security.routes.js";
import { registerAuthRoutes } from "./routes/auth.routes.js";
import { registerLogRoutes } from "./routes/logs.routes.js";
import { registerWhitelistRoutes } from "./routes/whitelist.routes.js";
import { registerDashboardRoutes } from "./routes/dashboard.routes.js";
import { registerPolicyRoutes } from "./routes/policies.routes.js";
import { registerRecoveryRoutes } from "./routes/recovery.routes.js";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerLiveRoutes } from "./routes/live.routes.js";
import { getMetrics } from "../infrastructure/metrics/metrics.js";

export async function createApiServer() {
  const app = Fastify({ logger: true, trustProxy: true });

  await app.register(cors, {
    origin: env.CORS_ALLOWED_ORIGINS.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  });

  await app.register(jwt, {
    secret: tokens.jwt.accessSecret
  });

  app.decorate("authenticate", async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ error: "Unauthorized" });
    }
  });

  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute"
  });

  app.get("/health", async () => ({ ok: true, service: "api" }));
  app.get("/metrics", async (_req, reply) => {
    reply.header("Content-Type", "text/plain; version=0.0.4");
    return reply.send(await getMetrics());
  });
  await registerAuthRoutes(app);
  await registerSecurityRoutes(app);
  await registerLogRoutes(app);
  await registerWhitelistRoutes(app);
  await registerDashboardRoutes(app);
  await registerPolicyRoutes(app);
  await registerRecoveryRoutes(app);
  await registerHealthRoutes(app);
  await registerLiveRoutes(app);

  return app;
}
