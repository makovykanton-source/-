import { env } from "./env.js";

export interface TokenConfig {
  discord: {
    botToken: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
}

function assertMinimumSecretLength(secret: string, name: string): void {
  if (secret.length < 32) {
    throw new Error(`${name} must be at least 32 chars`);
  }
}

export function loadTokenConfig(): TokenConfig {
  assertMinimumSecretLength(env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET");
  assertMinimumSecretLength(env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET");

  if (!env.DISCORD_TOKEN || !env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) {
    throw new Error("Discord token configuration is incomplete");
  }

  return {
    discord: {
      botToken: env.DISCORD_TOKEN,
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      redirectUri: env.DISCORD_REDIRECT_URI
    },
    jwt: {
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      accessTtl: env.JWT_ACCESS_TTL,
      refreshTtl: env.JWT_REFRESH_TTL
    }
  };
}

export const tokens = loadTokenConfig();
