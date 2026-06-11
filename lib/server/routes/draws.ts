import { Hono } from "hono";
import { getDb } from "../db";
import { draws, winningNumbers, bonds, matches as matchesTable, notificationBatches, notifications } from "../schema";
import { eq } from "drizzle-orm";
import { success, error, getEnv } from "../lib";
import { generateId } from "../id";

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
    const data = await db.select().from(winningNumbers).where(eq(winningNumbers.drawId, id)).all();
    return success(c, { winners: data, total: data.length });
  });
