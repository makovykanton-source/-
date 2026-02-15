export interface EnqueueModerationActionCommand {
  guildId: string;
  userId: string;
  action: "BAN" | "KICK" | "MUTE" | "STRIP_ROLES";
  reason: string;
}
