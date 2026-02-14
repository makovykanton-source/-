import { Guild, AuditLogEvent, PermissionsBitField } from "discord.js";
import { moderationQueue } from "../../infrastructure/queue/queues.js";
import { logger } from "../../core/logging/logger.js";

interface AntiNukeConfig {
  enabled: boolean;
  channelDeleteThreshold: number;
  roleDeleteThreshold: number;
  punishAction: "BAN" | "KICK" | "STRIP_ROLES";
  windowSeconds: number;
}

const actionCounters = new Map<string, { count: number; expiresAt: number }>();

export async function handleDestructiveAction(
  guild: Guild,
  config: AntiNukeConfig,
  action: "CHANNEL_DELETE" | "ROLE_DELETE"
): Promise<void> {
  if (!config.enabled) return;

  const auditType = action === "CHANNEL_DELETE" ? AuditLogEvent.ChannelDelete : AuditLogEvent.RoleDelete;
  const logs = await guild.fetchAuditLogs({ type: auditType, limit: 1 });
  const entry = logs.entries.first();
  if (!entry || !entry.executorId) return;

  const key = `${guild.id}:${entry.executorId}:${action}`;
  const threshold = action === "CHANNEL_DELETE" ? config.channelDeleteThreshold : config.roleDeleteThreshold;
  const now = Date.now();
  const current = actionCounters.get(key);
  const nextCount = !current || current.expiresAt < now ? 1 : current.count + 1;

  actionCounters.set(key, { count: nextCount, expiresAt: now + config.windowSeconds * 1000 });
  if (nextCount < threshold) return;

  const member = await guild.members.fetch(entry.executorId).catch(() => null);
  if (!member) return;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    logger.warn({ guildId: guild.id, actorId: member.id }, "Admin exceeded anti-nuke threshold, applying policy because zero-trust mode");
  }

  await moderationQueue.add("punish-user", {
    guildId: guild.id,
    userId: member.id,
    action: config.punishAction,
    reason: `Anti-nuke triggered: ${action}`
  });

  logger.error(
    { guildId: guild.id, actorId: member.id, action, nextCount },
    "Anti-nuke triggered and queued punishment"
  );
}
