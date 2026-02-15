import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pgPool } from "./postgres.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function migrate() {
    const sqlPath = path.join(__dirname, "sql", "schema.sql");
    const sql = await fs.readFile(sqlPath, "utf8");
    await pgPool.query(sql);
    await pgPool.end();
    console.log("Migration completed");
}
migrate().catch((err) => {
    console.error(err);
    process.exit(1);
});
