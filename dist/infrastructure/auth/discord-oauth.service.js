import { env } from "../../core/config/env.js";
export class DiscordOAuthService {
    getAuthorizeUrl(state) {
        const params = new URLSearchParams({
            client_id: env.DISCORD_CLIENT_ID,
            redirect_uri: env.DISCORD_REDIRECT_URI,
            response_type: "code",
            scope: "identify guilds",
            state,
            prompt: "none"
        });
        return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    }
}
