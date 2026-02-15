import { config } from "dotenv";
import { z } from "zod";
config();
const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(8080),
    API_HOST: z.string().default("0.0.0.0"),
    DISCORD_TOKEN: z.string().min(1),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    DISCORD_REDIRECT_URI: z.string().url(),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_TTL: z.string().default("15m"),
    JWT_REFRESH_TTL: z.string().default("30d"),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1),
    WS_ALLOWED_ORIGINS: z.string().default("https://dashboard.example.com"),
    CORS_ALLOWED_ORIGINS: z.string().default("https://dashboard.example.com"),
    SHARD_COUNT: z.coerce.number().default(1),
    SHARD_ID: z.coerce.number().optional(),
    METRICS_ENABLED: z.coerce.boolean().default(true)
});
export const env = EnvSchema.parse(process.env);
