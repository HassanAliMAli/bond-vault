import { Hono } from "hono";
import { getDb } from "../db";
import { ocrUsage } from "../schema";
import { eq, and } from "drizzle-orm";
import { success, error, getUserId, getEnv } from "../lib";
import { ocrUsageSchema } from "../validations";
import { generateId } from "../id";
import { getOcrUsage, canUseOcr, logAudit, getClientIp } from "../services";

export const ocrRoutes = new Hono()
  .post("/ocr/usage", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);

    const allowed = await canUseOcr(env, userId);
    if (!allowed) return error(c, "LIMIT_EXCEEDED", "Monthly OCR scan limit reached. Upgrade your plan for more scans.", 429);

    const body = await c.req.json();
    const parsed = ocrUsageSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const existing = await db
      .select()
      .from(ocrUsage)
      .where(and(eq(ocrUsage.userId, userId), eq(ocrUsage.year, year), eq(ocrUsage.month, month)))
      .get();

    if (existing) {
      await db
        .update(ocrUsage)
        .set({ successfulScans: existing.successfulScans + 1, updatedAt: now.toISOString() })
        .where(eq(ocrUsage.id, existing.id));
    } else {
      await db.insert(ocrUsage).values({
        id: generateId(),
        userId,
        year,
        month,
        successfulScans: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    }

    await logAudit(env, { userId, action: "ocr.scan", entityType: "ocr_usage", ipAddress: getClientIp(c) });
    return success(c, { message: "OCR scan recorded" });
  })
  .get("/ocr/usage", async (c) => {
    const env = getEnv(c);
    const userId = getUserId(c);
    const usage = await getOcrUsage(env, userId);
    return success(c, usage);
  });
