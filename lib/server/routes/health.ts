import { Hono } from "hono";
import { success, getEnv } from "../lib";

export const healthRoute = new Hono()
  .get("/health", async (c) => {
    const env = getEnv(c);
    let dbOk = false;
    try {
      await env.DB.prepare("SELECT 1").first();
      dbOk = true;
    } catch {}
    return success(c, { status: "ok", timestamp: new Date().toISOString(), database: dbOk ? "connected" : "disconnected" });
  });
