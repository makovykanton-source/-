import { FastifyInstance } from "fastify";
import { pgPool } from "../../infrastructure/db/postgres.js";
import { redis } from "../../infrastructure/cache/redis.js";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health/deep", async () => {
    const db = await pgPool.query("SELECT 1 as ok").then(() => true).catch(() => false);
    const cache = await redis.ping().then((x) => x === "PONG").catch(() => false);

    return {
      ok: db && cache,
      components: {
        postgres: db,
        redis: cache
      },
      ts: new Date().toISOString()
    };
  });
}
