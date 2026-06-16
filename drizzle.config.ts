import type { Config } from "drizzle-kit";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export default {
  schema: "./lib/server/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: requireEnv("CLOUDFLARE_ACCOUNT_ID"),
    databaseId: requireEnv("CLOUDFLARE_DATABASE_ID"),
    token: requireEnv("CLOUDFLARE_API_TOKEN"),
  },
} satisfies Config;
