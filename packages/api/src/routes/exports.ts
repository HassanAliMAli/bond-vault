import { Hono } from "hono";
import { getDb } from "../db";
import { bonds } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { authMiddleware } from "../middleware";
import { getUserId, getEnv } from "../lib/context";

export const exportRoutes = new Hono()
  .use(authMiddleware)
  .get("/exports/csv", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const userBonds = await db.select().from(bonds).where(
      and(eq(bonds.userId, userId), eq(bonds.status, "active" as any), isNull(bonds.deletedAt))
    ).all();

    const header = "Bond Number,Denomination,Status,Created At\n";
    const rows = userBonds.map(b => `${b.bondNumber},${b.denomination},${b.status},${b.createdAt}`).join("\n");
    const csv = header + rows;

    c.header("Content-Type", "text/csv");
    c.header("Content-Disposition", "attachment; filename=bonds.csv");
    return c.body(csv);
  })
  .get("/exports/xlsx", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const userBonds = await db.select().from(bonds).where(
      and(eq(bonds.userId, userId), eq(bonds.status, "active" as any), isNull(bonds.deletedAt))
    ).all();

    const header = "Bond Number\tDenomination\tStatus\tCreated At\n";
    const rows = userBonds.map(b => `${b.bondNumber}\t${b.denomination}\t${b.status}\t${b.createdAt}`).join("\n");
    const tsv = header + rows;

    c.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    c.header("Content-Disposition", "attachment; filename=bonds.xlsx");
    return c.body(tsv);
  });
