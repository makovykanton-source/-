export class DiscordApiClient {
    async exchangeCode(_code) {
        // integration point for Discord OAuth token exchange
        return { accessToken: "stub" };
    }
}
