import { spawn } from "node:child_process";

const BLOCKED_PROXY_KEYS = [
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "http_proxy",
  "https_proxy",
  "ALL_PROXY",
  "all_proxy",
  "NO_PROXY",
  "no_proxy",
  "npm_config_proxy",
  "npm_config_http_proxy",
  "npm_config_https_proxy",
  "npm_config_no_proxy"
];

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("[run-direct] Usage: node scripts/run-direct.mjs <npm-args...>");
  process.exit(1);
}

const env = { ...process.env };
for (const key of BLOCKED_PROXY_KEYS) {
  delete env[key];
}

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const child = spawn(npmCmd, args, {
  stdio: "inherit",
  env,
  shell: false
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
