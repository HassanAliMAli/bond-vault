import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

interface CloudflareBindings {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  BETTER_AUTH_SECRET: string;
  ENVIRONMENT: string;
}

export function createAuth(
  env?: CloudflareBindings,
  cf?: IncomingRequestCfProperties,
  baseURL?: string
) {
  if (!env || !env.DB) {
    return betterAuth({
      emailAndPassword: { enabled: true },
    });
  }

  const db = drizzle(env.DB, { schema });

  return betterAuth({
    baseURL,
    database: drizzleAdapter(db, { provider: "sqlite" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
    },
    secondaryStorage: {
      get: async (key) => env.KV.get(key),
      set: async (key, value, ttl) => {
        await env.KV.put(key, value, ttl ? { expirationTtl: Math.max(60, ttl) } : undefined);
      },
      delete: async (key) => env.KV.delete(key),
    },
  });
}