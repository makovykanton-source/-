import type { Guild } from "discord.js";
import * as Discord from "discord.js";
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

const AuditLogEvent = (Discord as any).AuditLogEvent;
const PermissionsBitField = (Discord as any).PermissionsBitField;
const GuildAuditLogs = (Discord as any).GuildAuditLogs;

function resolveAuditType(action: "CHANNEL_DELETE" | "ROLE_DELETE"): any {
  if (AuditLogEvent) {
    return action === "CHANNEL_DELETE" ? AuditLogEvent.ChannelDelete : AuditLogEvent.RoleDelete;
  }

  if (GuildAuditLogs?.Actions) {
    return action === "CHANNEL_DELETE"
      ? GuildAuditLogs.Actions.CHANNEL_DELETE
      : GuildAuditLogs.Actions.ROLE_DELETE;
  }

  return undefined;
}

function hasAdmin(member: any): boolean {
  if (!member) return false;
  if (PermissionsBitField?.Flags?.Administrator && member.permissions?.has) {
    return member.permissions.has(PermissionsBitField.Flags.Administrator);
  }
  if (member.permissions?.has && Discord.Permissions?.FLAGS?.ADMINISTRATOR) {
    return member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR);
  }
  return false;
}

export async function handleDestructiveAction(
  guild: Guild,
  config: AntiNukeConfig,
  action: "CHANNEL_DELETE" | "ROLE_DELETE"
): Promise<void> {
  if (!config.enabled) return;

  const auditType = resolveAuditType(action);
  const logs = await (guild as any).fetchAuditLogs({ type: auditType, limit: 1 });
  const entry = logs?.entries?.first?.();
  const executorId = entry?.executorId ?? entry?.executor?.id;
  if (!entry || !executorId) return;

  const key = `${guild.id}:${executorId}:${action}`;
  const threshold = action === "CHANNEL_DELETE" ? config.channelDeleteThreshold : config.roleDeleteThreshold;
  const now = Date.now();
  const current = actionCounters.get(key);
  const nextCount = !current || current.expiresAt < now ? 1 : current.count + 1;

  actionCounters.set(key, { count: nextCount, expiresAt: now + config.windowSeconds * 1000 });
  if (nextCount < threshold) return;

  const member = await (guild as any).members.fetch(executorId).catch(() => null);
  if (!member) return;
  if (hasAdmin(member)) {
    logger.warn(
      { guildId: guild.id, actorId: member.id },
      "Admin exceeded anti-nuke threshold, applying policy because zero-trust mode"
    );
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
