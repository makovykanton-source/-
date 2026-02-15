export interface AuditLogEntry {
  id: string;
  guildId: string;
  actorId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface AuditLogRepository {
  append(entry: AuditLogEntry): Promise<void>;
  latest(guildId: string, limit: number): Promise<AuditLogEntry[]>;
}
