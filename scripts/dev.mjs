import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import { resolve } from "node:path";

const isWindows = process.platform === "win32";
const pnpm = isWindows ? "pnpm.cmd" : "pnpm";
const envFile = resolve(".env.local");

const processes = [];
let shuttingDown = false;

function toPort(value, fallback) {
  const port = Number(value || fallback);
  return Number.isInteger(port) && port > 0 ? port : fallback;
}

function isPortAvailable(port) {
  return new Promise((resolvePort) => {
    const server = net.createServer();

    server.once("error", () => {
      resolvePort(false);
    });

    server.once("listening", () => {
      server.close(() => {
        resolvePort(true);
      });
    });

    server.listen(port, "0.0.0.0");
  });
}

async function findAvailablePort(preferredPort) {
  let port = preferredPort;

  while (!(await isPortAvailable(port))) {
    port += 1;
  }

  return port;
}

function readLocalEnv() {
  if (!existsSync(envFile)) return {};

  const env = {};
  const lines = readFileSync(envFile, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!key || key in process.env) continue;

    env[key] = value.replace(/^['"]|['"]$/g, "");
  }

  return env;
}

const localEnv = readLocalEnv();

function start(name, args, env) {
  const command = isWindows ? process.env.ComSpec || "cmd.exe" : pnpm;
  const commandArgs = isWindows ? ["/d", "/s", "/c", pnpm, ...args] : args;

  const child = spawn(command, commandArgs, {
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: false,
  });

  processes.push(child);

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;

    shuttingDown = true;
    const reason = signal ? `${signal}` : `exit code ${code ?? 0}`;
    console.log(`\n${name} stopped (${reason}). Shutting down dev server...`);
    stopAll();
    process.exit(code ?? 0);
  });
}

function stopAll() {
  for (const child of processes) {
    if (child.killed) continue;

    if (isWindows) {
      spawn(process.env.ComSpec || "cmd.exe", [
        "/d",
        "/s",
        "/c",
        "taskkill",
        "/pid",
        String(child.pid),
        "/t",
        "/f",
      ], { stdio: "ignore" });
    } else {
      child.kill();
    }
  }
}

process.on("SIGINT", () => {
  shuttingDown = true;
  stopAll();
});

process.on("SIGTERM", () => {
  shuttingDown = true;
  stopAll();
});

const apiPort = await findAvailablePort(
  toPort(process.env.API_PORT || localEnv.API_PORT, 8081),
);
const webPort = await findAvailablePort(
  toPort(process.env.WEB_PORT || localEnv.WEB_PORT || process.env.PORT, 3000),
);

console.log(`Starting API on http://localhost:${apiPort}`);
console.log(`Starting web app on http://localhost:${webPort}`);

start(
  "API",
  ["--filter", "@workspace/api-server", "run", "dev"],
  { ...localEnv, NODE_ENV: "development", PORT: String(apiPort) },
);

start(
  "Web",
  ["--filter", "@workspace/antyakshari", "run", "dev"],
  {
    PORT: String(webPort),
    API_URL: `http://localhost:${apiPort}`,
  },
);
