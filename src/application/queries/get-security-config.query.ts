import { SecurityConfigRepository } from "../ports/security-config.repository.js";

export class GetSecurityConfigQuery {
  constructor(private readonly repo: SecurityConfigRepository) {}

  async execute(guildId: string) {
    return this.repo.findByGuildId(guildId);
  }
}
