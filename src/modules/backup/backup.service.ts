import { backupQueue } from "../../infrastructure/queue/queues.js";

export async function enqueueGuildBackup(guildId: string): Promise<void> {
  await backupQueue.add("guild-backup", { guildId, requestedAt: new Date().toISOString() });
}
