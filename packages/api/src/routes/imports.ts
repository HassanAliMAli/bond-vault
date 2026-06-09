import { Hono } from "hono";
import { getDb } from "../db";
import { importJobs, bonds } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware, sessionMiddleware } from "../middleware";
import { success, error } from "../lib/response";
import { generateId } from "../lib/id";
import { getUserId, getEnv } from "../lib/context";

export const importRoutes = new Hono()
  .use(sessionMiddleware, authMiddleware)
  .post("/imports", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const formData = await c.req.formData();
    const file = formData.get("file") as unknown as File | null;
    if (!file) return error(c, "VALIDATION_ERROR", "File is required");

    const ext = file.name.split(".").pop()?.toLowerCase();
    const supported = ["csv", "xlsx", "txt"];
    if (!ext || !supported.includes(ext)) {
      return error(c, "VALIDATION_ERROR", `Unsupported file type. Use: ${supported.join(", ")}`);
    }

    const buffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    const valid: string[] = [];
    const invalid: string[] = [];
    const duplicates: string[] = [];
    const sixDigitRx = /^\d{6}$/;

    for (const line of lines) {
      const parts = line.includes(",") ? line.split(",") : [line];
      const bondNumber = parts[0].trim();
      if (!sixDigitRx.test(bondNumber)) {
        invalid.push(bondNumber);
        continue;
      }
      const existing = await db.select({ id: bonds.id }).from(bonds).where(
        and(eq(bonds.userId, userId), eq(bonds.bondNumber, bondNumber))
      ).get();
      if (existing) {
        duplicates.push(bondNumber);
      } else {
        valid.push(bondNumber);
      }
    }

    const jobId = generateId();
    const r2Key = `imports/${userId}/${jobId}_${Date.now()}`;
    await env.R2.put(r2Key, buffer);

    await db.insert(importJobs).values({
      id: jobId,
      userId,
      fileType: ext,
      status: "completed" as any,
      totalRecords: lines.length,
      successfulRecords: valid.length,
      duplicateRecords: duplicates.length,
      invalidRecords: invalid.length,
      r2FileKey: r2Key,
    } as any);

    return success(c, {
      importId: jobId,
      preview: { valid, invalid, duplicates },
      totals: {
        total: lines.length,
        valid: valid.length,
        invalid: invalid.length,
        duplicates: duplicates.length,
      },
    }, 201);
  })
  .get("/imports", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const data = await db.select().from(importJobs).where(eq(importJobs.userId, userId)).all();
    return success(c, { imports: data });
  })
  .get("/imports/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const job = await db.select().from(importJobs).where(and(eq(importJobs.id, id), eq(importJobs.userId, userId))).get();
    if (!job) return error(c, "NOT_FOUND", "Import not found", 404);
    return success(c, job);
  })
  .delete("/imports/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    await db.update(importJobs).set({ deletedAt: new Date().toISOString() } as any).where(
      and(eq(importJobs.id, id), eq(importJobs.userId, userId))
    );
    return success(c, { message: "Import deleted" });
  });
