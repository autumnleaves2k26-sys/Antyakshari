import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rm } from "node:fs/promises";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");

async function bundle() {
  console.log("Bundling api/index.ts to api/index.js...");
  await build({
    entryPoints: [path.resolve(rootDir, "api/index.ts")],
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    outfile: path.resolve(rootDir, "api/index.js"),
    logLevel: "info",
  });
  console.log("Successfully bundled serverless API function!");

  // On Vercel, delete the original .ts file to force Vercel's builder
  // to deploy the pre-bundled api/index.js directly, bypassing typescript compilation.
  if (process.env.VERCEL) {
    console.log("Vercel deployment environment detected. Cleaning up api/index.ts...");
    await rm(path.resolve(rootDir, "api/index.ts"), { force: true });
    console.log("api/index.ts removed successfully.");
  }
}

bundle().catch((err) => {
  console.error("Bundling failed:", err);
  process.exit(1);
});
