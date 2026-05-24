import { defineConfig } from "drizzle-kit";
import path from "path";

const base = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!base) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL must be set");
}

const url = process.env.SUPABASE_DATABASE_URL
  ? base.includes("?") ? base + "&sslmode=require" : base + "?sslmode=require"
  : base;

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: { url },
});
