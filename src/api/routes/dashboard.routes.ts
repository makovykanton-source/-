import { FastifyInstance } from "fastify";
import { requireGuildAdmin } from "../middleware/require-guild-admin.js";
import { PgSecurityEventRepository } from "../../infrastructure/repositories/pg-security-event.repository.js";
import { PgAuditLogRepository } from "../../infrastructure/repositories/pg-audit-log.repository.js";
import { SecurityDashboardUseCase } from "../../application/use-cases/security-dashboard.use-case.js";

const events = new PgSecurityEventRepository();
const audit = new PgAuditLogRepository();
const overview = new SecurityDashboardUseCase(events, audit);

export async function registerDashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/guilds/:guildId/dashboard/overview", { preHandler: [requireGuildAdmin] }, async (req) => {
    const { guildId } = req.params as { guildId: string };
    return overview.execute(guildId);
  });
}
