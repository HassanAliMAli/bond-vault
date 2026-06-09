import { Context, Next } from "hono";

export async function loggerMiddleware(c: Context, next: Next) {
  const start = Date.now();
  const { method, url } = c.req;
  await next();
  const elapsed = Date.now() - start;
  console.log(`${method} ${url} ${c.res.status} ${elapsed}ms`);
}

export async function authMiddleware(c: Context, next: Next) {
  const session = c.get("session");
  if (!session?.userId) {
    return c.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      401
    );
  }
  await next();
}

export async function adminMiddleware(c: Context, next: Next) {
  const isAdmin = c.get("isAdmin");
  if (!isAdmin) {
    return c.json(
      { success: false, error: { code: "FORBIDDEN", message: "Administrator access required" } },
      403
    );
  }
  await next();
}

export { sessionMiddleware } from "./session";
