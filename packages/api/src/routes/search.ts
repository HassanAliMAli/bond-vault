import { Hono } from "hono";
import { getDb } from "../db";
import { bonds } from "../db/schema";
import { eq, and, like, isNull } from "drizzle-orm";
import { authMiddleware, sessionMiddleware } from "../middleware";
import { success } from "../lib/response";
import { getUserId, getEnv } from "../lib/context";

export const searchRoutes = new Hono()
  .use(sessionMiddleware, authMiddleware)
  .get("/search", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const q = c.req.query("q");
    if (!q) return success(c, { results: [] });

    const bondResults = await db.select().from(bonds).where(
      and(eq(bonds.userId, userId), like(bonds.bondNumber, `%${q}%`), isNull(bonds.deletedAt))
    ).all();

    return success(c, { results: { bonds: bondResults } });
  });
