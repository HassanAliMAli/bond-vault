import { Hono } from "hono";
import { getDb } from "../db";
import { matches } from "../schema";
import { eq, and } from "drizzle-orm";
import { success, error, getUserId, getEnv } from "../lib";
import { logAudit, getClientIp } from "../services";

export const matchRoutes = new Hono()
  .get("/", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const status = c.req.query("status");
    const denomination = c.req.query("denomination");
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "50")));

    const conditions = [eq(matches.userId, userId)];
    if (status) conditions.push(eq(matches.status, status as any));
    if (denomination) conditions.push(eq(matches.denominationSnapshot, parseInt(denomination)));

    const total = (await db.select({ count: matches.id }).from(matches).where(and(...conditions)).all()).length;
    const data = await db.select().from(matches).where(and(...conditions)).limit(limit).offset((page - 1) * limit).all();
    return success(c, { matches: data, total });
  })
  .get("/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const match = await db.select().from(matches).where(and(eq(matches.id, id), eq(matches.userId, userId))).get();
    if (!match) return error(c, "NOT_FOUND", "Match not found", 404);
    return success(c, match);
  })
  .post("/:id/view", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const match = await db.select().from(matches).where(and(eq(matches.id, id), eq(matches.userId, userId))).get();
    if (!match) return error(c, "NOT_FOUND", "Match not found", 404);
    await db.update(matches).set({ status: "viewed" as any, updatedAt: new Date().toISOString() } as any).where(eq(matches.id, id));
    await logAudit(env, { userId, action: "match.viewed", entityType: "match", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "Match marked as viewed" });
  });
