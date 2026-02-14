export interface SecurityConfig {
  guildId: string;
  antiNukeEnabled: boolean;
  antiRaidEnabled: boolean;
  antiSpamEnabled: boolean;
  antiLinkEnabled: boolean;
  antiWebhookEnabled: boolean;
  autoLockdownEnabled: boolean;
  raidJoinThreshold: number;
  messageRatePer10s: number;
}

export interface SecurityConfigRepository {
  findByGuildId(guildId: string): Promise<SecurityConfig | null>;
  upsert(config: SecurityConfig): Promise<void>;
}
