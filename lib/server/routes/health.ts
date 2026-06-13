import { Hono } from "hono";
import { success, getEnv } from "../lib";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";

function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
}

export const healthRoute = new Hono()
  .get("/health", async (c) => {
    const env = getEnv(c);
    let dbOk = false;
    try {
      await env.DB.prepare("SELECT 1").first();
      dbOk = true;
    } catch {}
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
      // Use snake_case column names directly
      const stmt = db.insert(schema.users).values({
        id: testId,
        email: testId + "@drizzle.com",
        name: "Drizzle Test",
        emailVerified: false as any,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      });
      const result = await stmt.returning();
      return success(c, { drizzleResult: result[0] || null });
    } catch (e: any) {
      return c.json({ error: e?.message || String(e) }, 500);
    }
  });