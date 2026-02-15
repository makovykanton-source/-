import { Pool } from "pg";
import { env } from "../../core/config/env.js";
export const pgPool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 30,
    statement_timeout: 8000,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false
});
