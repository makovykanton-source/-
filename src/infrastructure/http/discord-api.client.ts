export class DiscordApiClient {
  async exchangeCode(_code: string): Promise<{ accessToken: string }> {
    // integration point for Discord OAuth token exchange
    return { accessToken: "stub" };
  }
}
