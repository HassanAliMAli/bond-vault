import { Hono } from "hono";
import { success, getEnv } from "../lib";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";
import { handleSubscriptionExpiration, handleRetentionCleanup, handleImportCleanup } from "../services";
import { logger } from "../logger";

const LAST_CLEANUP_KEY = "last_daily_cleanup";

async function maybeRunCleanup(env: Env) {
  const now = Date.now();
  const lastRaw = await env.KV.get(LAST_CLEANUP_KEY);
  const last = lastRaw ? parseInt(lastRaw, 10) : 0;
  const oneDay = 86_400_000;
  if (now - last >= oneDay) {
    await env.KV.put(LAST_CLEANUP_KEY, String(now));
    try {
      await handleSubscriptionExpiration(env);
    } catch (e) {
      logger.error("[cleanup] handleSubscriptionExpiration error", { message: (e as Error).message });
    }
    try {
      await handleRetentionCleanup(env);
    } catch (e) {
      logger.error("[cleanup] handleRetentionCleanup error", { message: (e as Error).message });
    }
    try {
      await handleImportCleanup(env);
    } catch (e) {
      logger.error("[cleanup] handleImportCleanup error", { message: (e as Error).message });
    }
  }
}

export const healthRoute = new Hono()
  .get("/health", async (c) => {
    const env = getEnv(c);
    let dbOk = false;
    try {
      await env.DB.prepare("SELECT 1").first();
      dbOk = true;
    } catch (e) {
      logger.warn("Health check DB error", { message: (e as Error).message });
    }
    c.executionCtx.waitUntil(maybeRunCleanup(env));
    return success(c, { status: "ok", timestamp: new Date().toISOString(), database: dbOk ? "connected" : "disconnected" });
  })
  .get("/debug/insert-raw", async (c) => {
    const env = getEnv(c);
    try {
      const testId = "raw-" + Date.now();
      const stmt = env.DB.prepare(
        "INSERT INTO users (id, email, name, email_verified, created_at, updated_at) VALUES (?, ?, ?, 0, datetime('now'), datetime('now')) RETURNING *"
      );
      const result = await stmt.bind(testId, testId + "@raw.com", "Raw Test").all();
      return success(c, { rawResult: result.results?.[0] || null });
    } catch (e: any) {
      return c.json({ error: e?.message || String(e) }, 500);
    }
  })
  .get("/debug/insert-drizzle", async (c) => {
    const env = getEnv(c);
    try {
      const db = drizzle(env.DB, { schema });
      const testId = "drizzle-" + Date.now();
      const stmt = db.insert(schema.users).values({
        id: testId,
        email: testId + "@drizzle.com",
        name: "Drizzle Test",
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const result = await stmt.returning();
      return success(c, { drizzleResult: result[0] || null });
    } catch (e: any) {
      return c.json({ error: e?.message || String(e) }, 500);
    }
  });
