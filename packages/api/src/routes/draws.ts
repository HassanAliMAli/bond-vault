import { Hono } from "hono";
import { getDb } from "../db";
import { draws, winningNumbers } from "../db/schema";
import { eq } from "drizzle-orm";
import { success, error } from "../lib/response";
import { getEnv } from "../lib/context";

export const drawRoutes = new Hono()
  .get("/", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const denomination = c.req.query("denomination");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");

    let query = db.select().from(draws).$dynamic();
    if (denomination) query = query.where(eq(draws.denomination, parseInt(denomination)));

    const data = await query.limit(limit).offset((page - 1) * limit).all();
    return success(c, { draws: data, total: data.length });
  })
  .get("/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const id = c.req.param("id");
    const draw = await db.select().from(draws).where(eq(draws.id, id)).get();
    if (!draw) return error(c, "NOT_FOUND", "Draw not found", 404);
    return success(c, draw);
  })
  .get("/:id/winners", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const id = c.req.param("id");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "100");

    const winners = await db.select().from(winningNumbers).where(eq(winningNumbers.drawId, id))
      .limit(limit).offset((page - 1) * limit).all();
    return success(c, { winners, total: winners.length });
  });
