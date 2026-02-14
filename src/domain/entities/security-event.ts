export type ThreatType =
  | "ANTI_NUKE"
  | "ANTI_RAID"
  | "ANTI_SPAM"
  | "ANTI_LINK"
  | "ANTI_WEBHOOK"
  | "ROLE_ESCALATION"
  | "PERMISSION_INTEGRITY"
  | "ANOMALY";

export interface SecurityEvent {
  id: string;
  guildId: string;
  actorId?: string;
  targetId?: string;
  threatType: ThreatType;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  payload: Record<string, unknown>;
  createdAt: Date;
}
