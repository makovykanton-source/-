import {
  Client,
  GatewayIntentBits,
  Partials,
  ChannelType,
  type NonThreadGuildBasedChannel
} from "discord.js";
import { env } from "../core/config/env.js";
import { tokens } from "../core/config/tokens.js";
import { logger } from "../core/logging/logger.js";
import { handleDestructiveAction } from "../modules/anti-nuke/anti-nuke.handler.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ],
  partials: [Partials.GuildMember, Partials.Channel]
});

function isGuildChannel(channel: NonThreadGuildBasedChannel | any): channel is NonThreadGuildBasedChannel {
  return channel?.type !== ChannelType.DM && Boolean(channel?.guild);
}

client.once("ready", () => logger.info({ shard: env.SHARD_ID }, "Discord bot ready"));

client.on("channelDelete", async (channel) => {
  if (!isGuildChannel(channel)) return;

  await handleDestructiveAction(
    channel.guild,
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

client.on("roleDelete", async (role) => {
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
