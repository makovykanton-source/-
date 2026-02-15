import { FastifyReply, FastifyRequest } from "fastify";
import { pgPool } from "../../infrastructure/db/postgres.js";

export async function requireGuildAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { guildId } = request.params as { guildId: string };
  const user = request.user as { id: string } | undefined;
  if (!user) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  const membership = await pgPool.query(
    `
      SELECT role_permissions
      FROM guild_user_roles
      WHERE guild_id = $1 AND user_id = $2
      LIMIT 1
    `,
    [guildId, user.id]
  );

  const permissions: string[] = membership.rows[0]?.role_permissions ?? [];
  if (!permissions.includes("MANAGE_GUILD")) {
    reply.code(403).send({ error: "Forbidden: missing MANAGE_GUILD" });
  }
}
