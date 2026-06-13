import { Hono } from "hono";
import { success, getEnv } from "../lib";
import { drizzle } from "drizzle-orm/d1";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import * as schema from "../schema";

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
  .get("/debug/adapter-test", async (c) => {
    const env = getEnv(c);
    try {
      const db = drizzle(env.DB, { schema });
      const adapter = drizzleAdapter(db, { provider: "sqlite" }) as any;
      const testId = "adapter-" + Date.now();
      const result = await adapter.create({
        model: "user",
        data: {
          id: testId,
          email: testId + "@test.com",
          name: "Adapter Test",
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return success(c, { result });
    } catch (e: any) {
      return c.json({ error: e?.message || String(e), stack: e?.stack }, 500);
    }
  });