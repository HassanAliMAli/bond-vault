import type { Context } from "hono";

export function getUserId(c: Context): string {
  return c.get("userId");
}

export function getEnv(c: Context): Env {
  return c.env as Env;
}

export function success<T>(c: Context, data: T, status = 200) {
  return c.json({ success: true, data, message: null }, status as any);
}

export function error(c: Context, code: string, message: string, status = 400) {
  return c.json(
    { success: false, error: { code, message } },
    status as any
  );
}
