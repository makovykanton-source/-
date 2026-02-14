import { GuildSecurityPolicy } from "../entities/guild-security-policy.js";

export interface PolicyRepository {
  findByGuildId(guildId: string): Promise<GuildSecurityPolicy | null>;
  save(policy: GuildSecurityPolicy): Promise<void>;
}
