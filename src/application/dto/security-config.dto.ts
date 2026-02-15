export interface UpdateSecurityConfigDto {
  antiNukeEnabled: boolean;
  antiRaidEnabled: boolean;
  antiSpamEnabled: boolean;
  antiLinkEnabled: boolean;
  antiWebhookEnabled: boolean;
  autoLockdownEnabled: boolean;
  raidJoinThreshold: number;
  messageRatePer10s: number;
}
