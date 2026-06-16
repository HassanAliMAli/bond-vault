import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

export function getUserId(c: Context): string {
  return c.get("userId");
}

export function getEnv(c: Context): Env {
  return c.env as Env;
}

export function success<T>(c: Context, data: T, status: StatusCode = 200) {
  return c.json({ success: true, data, message: null }, status);
}

export function error(c: Context, code: string, message: string, status: StatusCode = 400) {
  return c.json(
    { success: false, error: { code, message } },
    status
  );
}
