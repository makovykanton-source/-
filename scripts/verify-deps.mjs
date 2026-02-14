import fs from "node:fs";
import path from "node:path";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fail(msg) {
  console.error(`\n[verify:deps] ${msg}\n`);
  process.exit(1);
}

const cwd = process.cwd();
const pkg = readJson(path.join(cwd, "package.json"));
const expected = (pkg.overrides && pkg.overrides["discord.js"]) || pkg.dependencies?.["discord.js"];

const installedPkgPath = path.join(cwd, "node_modules", "discord.js", "package.json");
if (!fs.existsSync(installedPkgPath)) {
  fail("discord.js is not installed. Run npm install after cleaning node_modules/package-lock.json.");
}

const installed = readJson(installedPkgPath);
const version = installed.version || "0.0.0";
const major = Number(version.split(".")[0]);

if (!Number.isFinite(major) || major < 14) {
  fail(`discord.js@${version} detected, but v14+ is required (expected ${expected}).\\n` +
    "Fix: rm -rf node_modules package-lock.json && npm install && npm ls discord.js");
}

console.log(`[verify:deps] OK: discord.js@${version} (expected ${expected})`);
