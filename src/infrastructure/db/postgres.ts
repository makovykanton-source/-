import { config } from "dotenv";
import { Pool } from "pg";

config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for PostgreSQL connection");
}

const nodeEnv = process.env.NODE_ENV ?? "development";

export const pgPool = new Pool({
  connectionString: databaseUrl,
  max: 30,
  statement_timeout: 8000,
  ssl: nodeEnv === "production" ? { rejectUnauthorized: true } : false
});
