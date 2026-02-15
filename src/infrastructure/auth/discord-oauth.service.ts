import { tokens } from "../../core/config/tokens.js";

export class DiscordOAuthService {
  getAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: tokens.discord.clientId,
      redirect_uri: tokens.discord.redirectUri,
      response_type: "code",
      scope: "identify guilds",
      state,
      prompt: "none"
    });
    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }
}
