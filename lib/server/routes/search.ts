import { Hono } from "hono";
import { getDb } from "../db";
import { bonds } from "../schema";
import { eq, and, like, isNull } from "drizzle-orm";
import { success, getUserId, getEnv } from "../lib";

export const searchRoutes = new Hono()
  .get("/search", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const q = c.req.query("q");
    if (!q || q.length < 2) return success(c, { results: { bonds: [] } });

    const userBonds = await db
      .select()
      .from(bonds)
      .where(
        and(
          eq(bonds.userId, userId),
          isNull(bonds.deletedAt),
          like(bonds.bondNumber, `%${q}%`)
        )
      )
      .limit(20)
      .all();

    return success(c, { results: { bonds: userBonds } });
  });
