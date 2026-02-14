import { Client, TextChannel, PermissionsBitField } from "discord.js";

export class SecurityActionsService {
  constructor(private readonly client: Client) {}

  async enforceMessageDecision(
    guildId: string,
    channelId: string,
    messageId: string,
    userId: string,
    shouldDelete: boolean,
    shouldTimeout: boolean,
    reason: string
  ): Promise<void> {
    const guild = await this.client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(channelId);

    if (shouldDelete && channel && channel.isTextBased()) {
      const msg = await (channel as TextChannel).messages.fetch(messageId).catch(() => null);
      if (msg) await msg.delete().catch(() => null);
    }

    if (shouldTimeout) {
      const member = await guild.members.fetch(userId).catch(() => null);
      if (member) await member.timeout(10 * 60 * 1000, reason).catch(() => null);
    }
  }

  async enforceJoinDecision(
    guildId: string,
    userId: string,
    shouldKick: boolean,
    shouldRequireVerification: boolean,
    reason: string
  ): Promise<void> {
    const guild = await this.client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    if (shouldKick) {
      await member.kick(reason).catch(() => null);
      return;
    }

    if (shouldRequireVerification) {
      const mutedRole = guild.roles.cache.find((role) => role.name.toLowerCase() === "quarantine");
      if (mutedRole) {
        await member.roles.add(mutedRole, "Auto quarantine by security engine").catch(() => null);
      }
    }
  }

  async autoLockdown(guildId: string, reason: string): Promise<void> {
    const guild = await this.client.guilds.fetch(guildId);
    for (const [, channel] of guild.channels.cache) {
      if (!channel.isTextBased() || !channel.permissionsFor(guild.members.me!)) continue;

      const perms = channel.permissionOverwrites.cache.get(guild.roles.everyone.id);
      const canSend = perms?.allow.has(PermissionsBitField.Flags.SendMessages);
      if (canSend) {
        await channel.permissionOverwrites.edit(guild.roles.everyone.id, { SendMessages: false }, { reason });
      }
    }
  }
}
