import { Hono } from "hono";
import { getDb } from "../db";
import { matches } from "../schema";
import { eq, and } from "drizzle-orm";
import { success, error, getUserId, getEnv } from "../lib";

export const matchRoutes = new Hono()
  .get("/", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const status = c.req.query("status");
    const denomination = c.req.query("denomination");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "50");

    let query = db.select().from(matches).where(eq(matches.userId, userId)).$dynamic();
    if (status) query = query.where(eq(matches.status, status as any));
    if (denomination) query = query.where(eq(matches.denominationSnapshot, parseInt(denomination)));

    const data = await query.limit(limit).offset((page - 1) * limit).all();
    return success(c, { matches: data, total: data.length });
  })
  .get("/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const match = await db.select().from(matches).where(and(eq(matches.id, id), eq(matches.userId, userId))).get();
    if (!match) return error(c, "NOT_FOUND", "Match not found", 404);
    return success(c, match);
  });
