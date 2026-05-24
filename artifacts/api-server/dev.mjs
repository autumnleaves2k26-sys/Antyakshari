import { spawn } from "node:child_process";
import process from "node:process";

const env = {
  ...process.env,
  NODE_ENV: "development",
};

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      env,
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Process terminated with signal ${signal}`));
        return;
      }

      if (code && code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
        return;
      }

      resolve(undefined);
    });

    child.on("error", reject);
  });
}

await run("node", ["./build.mjs"]);
await run("node", ["--enable-source-maps", "./dist/index.mjs"]);