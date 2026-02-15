import { SecurityEvent } from "../entities/security-event.js";

export interface SecurityEventRepository {
  save(event: SecurityEvent): Promise<void>;
  latestByGuild(guildId: string, limit: number): Promise<SecurityEvent[]>;
}
