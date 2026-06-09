import { Hono } from "hono";
import { getDb } from "../db";
import { users, notificationPreferences, userPreferences } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, sessionMiddleware } from "../middleware";
import { success, error } from "../lib/response";
import { generateId } from "../lib/id";
import { getUserId, getEnv } from "../lib/context";

export const authRoutes = new Hono()
  .post("/register", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const body = await c.req.json();
    const { email, password, fullName } = body as { email: string; password: string; fullName?: string };

    if (!email || !password) {
      return error(c, "VALIDATION_ERROR", "Email and password are required");
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).get();
    if (existing) {
      return error(c, "CONFLICT", "Email already registered", 409);
    }

    const uid = generateId();
    const passwordHash = await hashPassword(password);

    await db.insert(users).values({
      id: uid,
      email,
      passwordHash,
      fullName: fullName || null,
    } as any);

    await db.insert(notificationPreferences).values({ id: generateId(), userId: uid } as any);
    await db.insert(userPreferences).values({ id: generateId(), userId: uid } as any);

    return success(c, { userId: uid, email }, 201);
  })
  .post("/login", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const body = await c.req.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return error(c, "VALIDATION_ERROR", "Email and password are required");
    }

    const user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return error(c, "UNAUTHORIZED", "Invalid email or password", 401);
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const sessionId = generateId();

    await env.DB.prepare(
      "INSERT INTO session (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)"
    ).bind(sessionId, user.id, sessionToken, expiresAt).run();

    await db.update(users).set({ lastLoginAt: new Date().toISOString() } as any).where(eq(users.id, user.id));

    c.header("Set-Cookie", `better-auth.session_token=${sessionToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`);

    return success(c, { userId: user.id, email: user.email, token: sessionToken });
  })
  .post("/logout", sessionMiddleware, async (c) => {
    const env = getEnv(c);
    const cookie = c.req.header("Cookie");
    if (cookie) {
      const match = cookie.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        await env.DB.prepare("DELETE FROM session WHERE token = ?").bind(match[1]).run();
      }
    }
    c.header("Set-Cookie", "better-auth.session_token=; HttpOnly; Path=/; Max-Age=0");
    return success(c, { message: "Logged out" });
  })
  .get("/me", sessionMiddleware, authMiddleware, async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) return error(c, "NOT_FOUND", "User not found", 404);
    return success(c, {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
    });
  });

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash;
}
