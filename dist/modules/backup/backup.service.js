import { backupQueue } from "../../infrastructure/queue/queues.js";
export async function enqueueGuildBackup(guildId) {
    await backupQueue.add("guild-backup", { guildId, requestedAt: new Date().toISOString() });
}
