import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");

async function bundle() {
  console.log("Bundling Vercel serverless entrypoint...");
  await build({
    entryPoints: [path.resolve(rootDir, "artifacts/api-server/src/vercel-entry.ts")],
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    outfile: path.resolve(rootDir, "api/index.js"),
    logLevel: "info",
  });
  console.log("Successfully bundled serverless API function to api/index.js!");
}

bundle().catch((err) => {
  console.error("Bundling failed:", err);
  process.exit(1);
});
