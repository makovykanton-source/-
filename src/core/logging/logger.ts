import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  name: "discord-shield",
  level: env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "discordToken",
      "jwt",
      "refreshToken"
    ],
    remove: true
  }
});
