import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
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
  if (!env) {
    return betterAuth({
      ...withCloudflare(
        {
          autoDetectIpAddress: true,
          geolocationTracking: true,
          cf: cf || {},
        },
        {
          emailAndPassword: { enabled: true },
        }
      ),
      database: drizzleAdapter({} as D1Database, {
        provider: "sqlite",
        usePlural: true,
      }),
    });
  }

  const db = drizzle(env.DB, { schema, logger: env.ENVIRONMENT !== "production" });

  return betterAuth({
    baseURL,
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: cf || {},
        d1: {
          db,
          options: {
            usePlural: true,
            debugLogs: env.ENVIRONMENT !== "production",
          },
        },
        kv: env.KV as any,
      },
      {
        emailAndPassword: {
          enabled: true,
          minPasswordLength: 8,
        },
        rateLimit: {
          enabled: true,
          window: 60,
          max: 100,
          customRules: {
            "/sign-in/email": { window: 60, max: 100 },
            "/sign-up/email": { window: 60, max: 20 },
          },
        },
      }
    ),
  });
}
