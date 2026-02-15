import { FastifyInstance } from "fastify";
import { discordLogin } from "../controllers/auth.controller.js";

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/auth/discord/login", discordLogin);
}
