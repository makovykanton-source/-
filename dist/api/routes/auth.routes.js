import { discordLogin } from "../controllers/auth.controller.js";
export async function registerAuthRoutes(app) {
    app.get("/api/v1/auth/discord/login", discordLogin);
}
