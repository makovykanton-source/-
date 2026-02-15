export class UpdateSecurityConfigUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(guildId, dto) {
        await this.repo.upsert({ guildId, ...dto });
    }
}
