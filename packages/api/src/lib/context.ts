import type { Context } from "hono";

export function getUserId(c: Context): string {
  return (c.get as unknown as (key: string) => string)("userId");
}

export function getEnv(c: Context): Env {
  return c.env as Env;
}
