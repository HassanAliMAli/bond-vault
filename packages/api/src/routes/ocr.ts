import { Hono } from "hono";
import { getDb } from "../db";
import { ocrUsage } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware";
import { success, error } from "../lib/response";
import { ocrUsageSchema } from "../validations";
import { generateId } from "../lib/id";
import { getUserId, getEnv } from "../lib/context";

export const ocrRoutes = new Hono()
  .use(authMiddleware)
  .get("/ocr/usage", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const record = await db.select().from(ocrUsage).where(
      and(eq(ocrUsage.userId, userId), eq(ocrUsage.year, year), eq(ocrUsage.month, month))
    ).get();

    const used = record?.successfulScans ?? 0;
    return success(c, { used, remaining: Math.max(0, 3 - used) });
  })
  .post("/ocr/usage", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const body = await c.req.json();
    const parsed = ocrUsageSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const existing = await db.select().from(ocrUsage).where(
      and(eq(ocrUsage.userId, userId), eq(ocrUsage.year, year), eq(ocrUsage.month, month))
    ).get();

    if (existing) {
      await db.update(ocrUsage).set({ successfulScans: existing.successfulScans + 1, updatedAt: new Date().toISOString() } as any).where(eq(ocrUsage.id, existing.id));
    } else {
      await db.insert(ocrUsage).values({ id: generateId(), userId, year, month, successfulScans: 1 } as any);
    }

    return success(c, { message: "OCR scan recorded" }, 201);
  });
