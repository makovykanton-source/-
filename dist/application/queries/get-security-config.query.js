export class GetSecurityConfigQuery {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(guildId) {
        return this.repo.findByGuildId(guildId);
    }
}
