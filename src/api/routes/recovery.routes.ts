import { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireGuildAdmin } from "../middleware/require-guild-admin.js";
import { RestoreBackupUseCase } from "../../application/use-cases/restore-backup.use-case.js";
import { PgAuditLogRepository } from "../../infrastructure/repositories/pg-audit-log.repository.js";

class StubBackupProvider {
  async restore(_guildId: string, backupId: string): Promise<{ ok: boolean; details: string }> {
    return { ok: true, details: `backup ${backupId} restored` };
  }
}

const restore = new RestoreBackupUseCase(new StubBackupProvider(), new PgAuditLogRepository());

const Body = z.object({
  backupId: z.string().min(1)
});

export async function registerRecoveryRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/v1/guilds/:guildId/recovery/restore", { preHandler: [requireGuildAdmin] }, async (req) => {
    const { guildId } = req.params as { guildId: string };
    const user = req.user as { id?: string } | undefined;
    const body = Body.parse(req.body);
    return restore.execute(guildId, user?.id ?? "system", body.backupId);
  });
}
