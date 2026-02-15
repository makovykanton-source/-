import { FastifyReply, FastifyRequest } from "fastify";
import { DiscordOAuthService } from "../../infrastructure/auth/discord-oauth.service.js";
import { TokenService } from "../../core/security/token.service.js";

const oauth = new DiscordOAuthService();
const tokenService = new TokenService();

export async function discordLogin(_req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const state = tokenService.randomState();
  reply.send({ url: oauth.getAuthorizeUrl(state), state });
}
