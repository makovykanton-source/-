import * as Discord from "discord.js";
import { env } from "../core/config/env.js";
import { tokens } from "../core/config/tokens.js";
import { logger } from "../core/logging/logger.js";
import { handleDestructiveAction } from "../modules/anti-nuke/anti-nuke.handler.js";

const GatewayIntentBits = (Discord as any).GatewayIntentBits ?? (Discord as any).Intents?.FLAGS;
const Partials = (Discord as any).Partials ?? (Discord as any).Constants?.Partials;

const client = new Discord.Client({
  intents: [
    GatewayIntentBits?.Guilds,
    GatewayIntentBits?.GuildMembers,
    GatewayIntentBits?.GuildMessages,
    GatewayIntentBits?.MessageContent,
    GatewayIntentBits?.GuildModeration,
    GatewayIntentBits?.GUILD_MEMBERS,
    GatewayIntentBits?.GUILD_MESSAGES
  ].filter(Boolean),
  partials: [Partials?.GuildMember, Partials?.Channel].filter(Boolean)
} as any);

client.once("ready", () => logger.info({ shard: env.SHARD_ID }, "Discord bot ready"));

client.on("channelDelete", async (channel: any) => {
  const guild = channel?.guild;
  if (!guild) return;

  await handleDestructiveAction(
    guild,
    {
      enabled: true,
      channelDeleteThreshold: 3,
      roleDeleteThreshold: 2,
      punishAction: "BAN",
      windowSeconds: 15
    },
    "CHANNEL_DELETE"
  );
});

client.on("roleDelete", async (role: any) => {
  if (!role?.guild) return;
  await handleDestructiveAction(
    role.guild,
    {
      enabled: true,
      channelDeleteThreshold: 3,
      roleDeleteThreshold: 2,
      punishAction: "BAN",
      windowSeconds: 15
    },
    "ROLE_DELETE"
  );
});

client.login(tokens.discord.botToken);
