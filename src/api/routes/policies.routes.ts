import { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireGuildAdmin } from "../middleware/require-guild-admin.js";
import { PgPolicyRepository } from "../../infrastructure/repositories/pg-policy.repository.js";
import { DefaultPolicy } from "../../domain/entities/guild-security-policy.js";

const policyRepo = new PgPolicyRepository();

const ModuleSchema = z.object({
  antiNuke: z.boolean(),
  antiRaid: z.boolean(),
  antiSpam: z.boolean(),
  antiLink: z.boolean(),
  antiWebhook: z.boolean(),
  roleIntegrity: z.boolean(),
  permissionIntegrity: z.boolean(),
  anomalyDetection: z.boolean(),
  backupRecovery: z.boolean()
});

const ThresholdSchema = z.object({
  channelDeletePerWindow: z.number().int().min(1).max(20),
  roleDeletePerWindow: z.number().int().min(1).max(20),
  joinBurstPer15s: z.number().int().min(2).max(200),
  messageRatePer10s: z.number().int().min(2).max(100),
  webhookCreatePer10s: z.number().int().min(1).max(20),
  anomalyScore: z.number().int().min(1).max(100),
  lockdownThreatsPerMinute: z.number().int().min(2).max(200)
});

const ResponseSchema = z.object({
  antiNukeAction: z.enum(["BAN", "KICK", "STRIP_ROLES"]),
  antiRaidAction: z.enum(["LOCKDOWN", "KICK_NEW_MEMBERS"]),
  spamAction: z.enum(["DELETE_AND_MUTE", "DELETE_AND_WARN"]),
  linkAction: z.enum(["DELETE", "DELETE_AND_TIMEOUT"]),
  webhookAction: z.enum(["DELETE_WEBHOOK_AND_BAN", "DELETE_WEBHOOK"])
});

export async function registerPolicyRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/guilds/:guildId/policies", { preHandler: [requireGuildAdmin] }, async (req) => {
    const { guildId } = req.params as { guildId: string };
    const policy = await policyRepo.findByGuildId(guildId);
    if (!policy) {
      return {
        guildId,
        ...DefaultPolicy,
        updatedAt: new Date().toISOString()
      };
    }
    return policy;
  });

  app.put("/api/v1/guilds/:guildId/policies", { preHandler: [requireGuildAdmin] }, async (req, reply) => {
    const { guildId } = req.params as { guildId: string };
    const body = req.body as Record<string, unknown>;

    const modules = ModuleSchema.parse(body.modules);
    const thresholds = ThresholdSchema.parse(body.thresholds);
    const response = ResponseSchema.parse(body.response);

    await policyRepo.save({
      guildId,
      modules,
      thresholds,
      response,
      updatedAt: new Date()
    });

    reply.code(204).send();
  });
}
