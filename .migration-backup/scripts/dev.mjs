import { readFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  const env = {};
  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 0) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

const fileEnv = {
  ...parseEnvFile(path.join(rootDir, ".env.local")),
  ...parseEnvFile(path.join(rootDir, ".env")),
};

function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      const server = net.createServer();

      server.once("error", (error) => {
        if (error && typeof error === "object" && error.code === "EADDRINUSE") {
          tryPort(port + 1);
          return;
        }

        reject(error);
      });

      server.listen(port, "::", () => {
        const address = server.address();

        if (!address || typeof address === "string") {
          server.close(() => reject(new Error("Unable to resolve free port")));
          return;
        }

        const { port: resolvedPort } = address;
        server.close(() => resolve(resolvedPort));
      });
    };

    tryPort(startPort);
  });
}

function run(command, args, extraEnv, label) {
  const isWindows = process.platform === "win32";
  const spawnCommand = isWindows ? process.env.ComSpec || "cmd.exe" : command;
  const spawnArgs = isWindows ? ["/c", command, ...args] : args;

  const child = spawn(spawnCommand, spawnArgs, {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.on("exit", (code, signal) => {
    if (signal || (typeof code === "number" && code !== 0)) {
      process.exitCode = code ?? 1;
      shutdown();
    }
  });

  child.on("error", (error) => {
    console.error(`[${label}]`, error);
    process.exitCode = 1;
    shutdown();
  });

  return child;
}

let shuttingDown = false;
const children = [];

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", shutdown);

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const apiPort = await findFreePort(Number(process.env.API_PORT || 8081));
const webPort = Number(process.env.PORT || 3000);

const supabaseUrl = fileEnv.SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseServiceRoleKey =
  fileEnv.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "Missing Supabase env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
  );
  process.exit(1);
}

console.log(`Starting API on http://localhost:${apiPort}`);
console.log(`Starting frontend on http://localhost:${webPort}`);

children.push(
  run(pnpmCommand, ["--filter", "@workspace/api-server", "run", "dev"], {
    PORT: String(apiPort),
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
    SUPABASE_ANON_KEY: fileEnv.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
  }, "api-server"),
);

children.push(
  run(pnpmCommand, ["--filter", "@workspace/antyakshari", "run", "dev"], {
    PORT: String(webPort),
    BASE_PATH: "/",
    API_PORT: String(apiPort),
  }, "antyakshari"),
);