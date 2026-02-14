import { SecurityConfigRepository } from "../ports/security-config.repository.js";
import { UpdateSecurityConfigDto } from "../dto/security-config.dto.js";

export class UpdateSecurityConfigUseCase {
  constructor(private readonly repo: SecurityConfigRepository) {}

  async execute(guildId: string, dto: UpdateSecurityConfigDto): Promise<void> {
    await this.repo.upsert({ guildId, ...dto });
  }
}
