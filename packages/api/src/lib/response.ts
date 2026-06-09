import type { Context } from "hono";

export function success<T>(c: Context, data: T, status = 200) {
  return c.json({ success: true, data, message: null }, status as Parameters<Context["json"]>[1]);
}

export function error(
  c: Context,
  code: string,
  message: string,
  status = 400
) {
  return c.json(
    { success: false, error: { code, message } },
    status as Parameters<Context["json"]>[1]
  );
}
