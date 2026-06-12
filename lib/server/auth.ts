import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import { withCloudflare } from "better-auth-cloudflare";
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
      ...withCloudflare(
        {
          autoDetectIpAddress: true,
          geolocationTracking: false,
          cf: cf || {},
        },
        {
          emailAndPassword: { enabled: true },
        }
      ),
    });
  }

  const db = drizzle(env.DB, { schema });

  return betterAuth({
    baseURL,
    database: drizzleAdapter(db, { provider: "sqlite", usePlural: false }),
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: false,
        cf: cf || {},
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
