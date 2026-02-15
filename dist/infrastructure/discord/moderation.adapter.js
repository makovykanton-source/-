export class DiscordModerationAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    async punish(guildId, userId, action, reason) {
        const guild = await this.client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);
        if (action === "BAN")
            await member.ban({ reason });
        if (action === "KICK")
            await member.kick(reason);
        if (action === "STRIP_ROLES")
            await member.roles.set([], reason);
        if (action === "MUTE")
            await member.timeout(10 * 60 * 1000, reason);
    }
}
