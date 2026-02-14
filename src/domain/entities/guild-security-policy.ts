export interface ModuleToggle {
  antiNuke: boolean;
  antiRaid: boolean;
  antiSpam: boolean;
  antiLink: boolean;
  antiWebhook: boolean;
  roleIntegrity: boolean;
  permissionIntegrity: boolean;
  anomalyDetection: boolean;
  backupRecovery: boolean;
}

export interface ThresholdPolicy {
  channelDeletePerWindow: number;
  roleDeletePerWindow: number;
  joinBurstPer15s: number;
  messageRatePer10s: number;
  webhookCreatePer10s: number;
  anomalyScore: number;
  lockdownThreatsPerMinute: number;
}

export interface ResponsePolicy {
  antiNukeAction: "BAN" | "KICK" | "STRIP_ROLES";
  antiRaidAction: "LOCKDOWN" | "KICK_NEW_MEMBERS";
  spamAction: "DELETE_AND_MUTE" | "DELETE_AND_WARN";
  linkAction: "DELETE" | "DELETE_AND_TIMEOUT";
  webhookAction: "DELETE_WEBHOOK_AND_BAN" | "DELETE_WEBHOOK";
}

export interface GuildSecurityPolicy {
  guildId: string;
  modules: ModuleToggle;
  thresholds: ThresholdPolicy;
  response: ResponsePolicy;
  updatedAt: Date;
}

export const DefaultPolicy: Omit<GuildSecurityPolicy, "guildId" | "updatedAt"> = {
  modules: {
    antiNuke: true,
    antiRaid: true,
    antiSpam: true,
    antiLink: true,
    antiWebhook: true,
    roleIntegrity: true,
    permissionIntegrity: true,
    anomalyDetection: true,
    backupRecovery: true
  },
  thresholds: {
    channelDeletePerWindow: 3,
    roleDeletePerWindow: 2,
    joinBurstPer15s: 8,
    messageRatePer10s: 7,
    webhookCreatePer10s: 3,
    anomalyScore: 40,
    lockdownThreatsPerMinute: 10
  },
  response: {
    antiNukeAction: "BAN",
    antiRaidAction: "LOCKDOWN",
    spamAction: "DELETE_AND_MUTE",
    linkAction: "DELETE_AND_TIMEOUT",
    webhookAction: "DELETE_WEBHOOK_AND_BAN"
  }
};
