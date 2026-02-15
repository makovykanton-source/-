import { AuditLogRepository } from "../../domain/repositories/audit-log.repository.js";
import { v4 as uuid } from "uuid";

export interface BackupProvider {
  restore(guildId: string, backupId: string): Promise<{ ok: boolean; details: string }>;
}

export class RestoreBackupUseCase {
  constructor(
    private readonly provider: BackupProvider,
    private readonly audit: AuditLogRepository
  ) {}

  async execute(guildId: string, actorId: string, backupId: string): Promise<{ ok: boolean; details: string }> {
    const result = await this.provider.restore(guildId, backupId);

    await this.audit.append({
      id: uuid(),
      guildId,
      actorId,
      action: "BACKUP_RESTORE",
      resourceType: "BACKUP",
      resourceId: backupId,
      metadata: {
        ok: result.ok,
        details: result.details
      },
      createdAt: new Date()
    });

    return result;
  }
}
