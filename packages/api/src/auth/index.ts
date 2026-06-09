import type { D1Database, IncomingRequestCfProperties } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";

interface CloudflareBindings {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  BETTER_AUTH_SECRET: string;
  ENVIRONMENT: string;
}

function createAuth(env?: CloudflareBindings, cf?: IncomingRequestCfProperties, baseURL?: string) {
  const db = env ? drizzle(env.DB, { schema, logger: env.ENVIRONMENT !== "production" }) : ({} as any);

  return betterAuth({
    baseURL,
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: cf || {},
        d1: env
          ? {
              db,
              options: {
                usePlural: true,
                debugLogs: env.ENVIRONMENT !== "production",
              },
            }
          : undefined,
        kv: env?.KV,
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
    ...(env
      ? {}
      : {
          database: drizzleAdapter({} as D1Database, {
            provider: "sqlite",
            usePlural: true,
          }),
        }),
  });
}

export const auth = createAuth();
export { createAuth };
