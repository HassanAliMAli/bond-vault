import { Hono } from "hono";
import { success } from "../lib/response";

export const healthRoute = new Hono().get("/health", async (c) => {
  let dbOk = false;
  try {
    await (c.env as Env).DB.prepare("SELECT 1").first();
    dbOk = true;
  } catch {}

  return success(c, {
    status: "ok",
    timestamp: new Date().toISOString(),
    database: dbOk ? "connected" : "disconnected",
  });
});
