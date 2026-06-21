import { Hono } from "hono";
import { getDb } from "../db";
import { bonds } from "../schema";
import { eq, and, isNull } from "drizzle-orm";
import { getUserId, getEnv } from "../lib";
import { canExport, logAudit, getClientIp } from "../services";

export const exportRoutes = new Hono()
  .get("/exports/csv", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);

    const allowed = await canExport(env, userId);
    if (!allowed) return c.json({ success: false, error: { code: "FORBIDDEN", message: "Exporting requires a paid plan. Upgrade to export." } }, 403);

    const userBonds = await db.select().from(bonds).where(and(eq(bonds.userId, userId), isNull(bonds.deletedAt))).all();
    const header = "Bond Number,Denomination,Status,Added Date\n";
    const rows = userBonds.map(b => `${b.bondNumber},${b.denomination},${b.status},${b.createdAt}`).join("\n");
    const csv = header + rows;

    await logAudit(env, { userId, action: "export.csv", entityType: "user", entityId: userId, ipAddress: getClientIp(c) });
    return c.body(csv, 200, {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="bondvault-portfolio-${new Date().toISOString().split("T")[0]}.csv"`,
    });
  })
  .get("/exports/xlsx", async (c) => {
    return c.redirect("/api/v1/exports/csv", 308);
  });
