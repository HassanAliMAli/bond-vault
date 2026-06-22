import { Hono } from "hono";
import { getDb } from "../db";
import { importJobs, bonds, type BondEntryMethod, type ImportJobFileType } from "../schema";
import { eq, and, isNull } from "drizzle-orm";
import { success, error, getUserId, getEnv } from "../lib";
import { generateId } from "../id";
import { canImport, logAudit, getClientIp, createStorageProvider, checkRateLimit, RATE_LIMITS } from "../services";
import { txtImportSchema } from "../validations";

export const importRoutes = new Hono()
  .post("/imports", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);

    const { allowed: rateAllowed } = await checkRateLimit(env.KV, `imports:${userId}`, RATE_LIMITS.imports.limit, RATE_LIMITS.imports.window);
    if (!rateAllowed) return error(c, "RATE_LIMITED", "Too many import requests. Please try again later.", 429);

    const allowed = await canImport(env, userId);
    if (!allowed) return error(c, "FORBIDDEN", "Importing bonds requires a paid plan. Upgrade to import.", 403);

    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return error(c, "VALIDATION_ERROR", "File is required");

    const fileName = file.name.toLowerCase();
    let fileType: ImportJobFileType = "csv";
    if (fileName.endsWith(".csv")) fileType = "csv";
    else if (fileName.endsWith(".xlsx")) fileType = "xlsx";
    else return error(c, "VALIDATION_ERROR", "Unsupported file type. Supported: CSV, XLSX");

    const buffer = await file.arrayBuffer();
    const content = new TextDecoder().decode(buffer);
    const lines = content.split("\n").filter(l => l.trim());
    const valid: Array<{ bondNumber: string; denomination: number }> = [];
    const invalid: string[] = [];
    const duplicates: string[] = [];

    const denominationMap: Record<string, number> = {
      "100": 100, "200": 200, "750": 750, "1500": 1500,
      "7500": 7500, "25000": 25000, "40000": 40000,
    };

    for (const line of lines) {
      const parts = line.split(",").map(s => s.trim());
      if (parts.length < 2) { invalid.push(line); continue; }
      const bondNumber = parts[0].replace(/\D/g, "");
      const denomStr = parts[1].replace(/\D/g, "");
      const denomination = denominationMap[denomStr];

      if (!/^\d{6}$/.test(bondNumber) || !denomination) {
        invalid.push(line);
        continue;
      }

      const existing = await db.select({ id: bonds.id }).from(bonds).where(
        and(eq(bonds.userId, userId), eq(bonds.bondNumber, bondNumber), eq(bonds.denomination, denomination), isNull(bonds.deletedAt))
      ).get();

      if (existing) {
        duplicates.push(line);
        continue;
      }

      valid.push({ bondNumber, denomination });
    }

    const importId = generateId();
    const storage = createStorageProvider(env);
    await storage.upload(`imports/${userId}/${importId}_${file.name}`, buffer, file.type);

    await db.insert(importJobs).values({
      id: importId,
      userId,
      fileType,
      status: "pending",
      totalRecords: lines.length,
      successfulRecords: valid.length,
      duplicateRecords: duplicates.length,
      invalidRecords: invalid.length,
      r2FileKey: `imports/${userId}/${importId}_${file.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await logAudit(env, { userId, action: "import.create", entityType: "import_job", entityId: importId, metadata: { total: lines.length, valid: valid.length, invalid: invalid.length, duplicates: duplicates.length }, ipAddress: getClientIp(c) });

    return success(c, {
      importId,
      preview: { valid: valid.map(v => v.bondNumber), invalid, duplicates },
      totals: { total: lines.length, valid: valid.length, invalid: invalid.length, duplicates: duplicates.length },
    }, 201);
  })
  .post("/imports/txt", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);

    const { allowed: rateAllowed } = await checkRateLimit(env.KV, `imports:${userId}`, RATE_LIMITS.imports.limit, RATE_LIMITS.imports.window);
    if (!rateAllowed) return error(c, "RATE_LIMITED", "Too many import requests. Please try again later.", 429);

    const allowed = await canImport(env, userId);
    if (!allowed) return error(c, "FORBIDDEN", "Importing bonds requires a paid plan. Upgrade to import.", 403);

    const body = await c.req.json();
    const parsed = txtImportSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0]?.message || "Invalid bond data");

    let saved = 0;
    let duplicates = 0;
    const validBonds: Array<{ bondNumber: string; denomination: number }> = [];

    for (const bond of parsed.data.bonds) {
      const existing = await db.select({ id: bonds.id }).from(bonds).where(
        and(eq(bonds.userId, userId), eq(bonds.bondNumber, bond.bondNumber), eq(bonds.denomination, bond.denomination), isNull(bonds.deletedAt))
      ).get();
      if (existing) {
        duplicates++;
        continue;
      }
      validBonds.push(bond);
    }

    for (const bond of validBonds) {
      const bondId = generateId();
      await db.insert(bonds).values({
        id: bondId,
        userId,
        bondNumber: bond.bondNumber,
        denomination: bond.denomination,
        status: "active",
        entryMethod: "txt",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      saved++;
    }

    const importId = generateId();
    await db.insert(importJobs).values({
      id: importId,
      userId,
      fileType: "txt",
      status: "completed",
      totalRecords: parsed.data.bonds.length,
      successfulRecords: saved,
      duplicateRecords: duplicates,
      invalidRecords: parsed.data.bonds.length - saved - duplicates,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await logAudit(env, { userId, action: "import.txt", entityType: "import_job", entityId: importId, metadata: { total: parsed.data.bonds.length, saved, duplicates, invalid: parsed.data.bonds.length - saved - duplicates }, ipAddress: getClientIp(c) });

    return success(c, { saved, duplicates, invalid: parsed.data.bonds.length - saved - duplicates, importId }, 201);
  })
  .post("/imports/:id/confirm", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");

    const job = await db.select().from(importJobs).where(and(eq(importJobs.id, id), eq(importJobs.userId, userId))).get();
    if (!job) return error(c, "NOT_FOUND", "Import job not found", 404);
    if (job.status !== "pending") return error(c, "BAD_REQUEST", "Import already processed", 400);

    const storage = createStorageProvider(env);
    const fileObj = await storage.get(job.r2FileKey!);
    if (!fileObj) return error(c, "NOT_FOUND", "Import file not found in storage", 404);

    const content = await fileObj.text();
    const lines = content.split("\n").filter(l => l.trim());
    let saved = 0;

    const denominationMap: Record<string, number> = {
      "100": 100, "200": 200, "750": 750, "1500": 1500,
      "7500": 7500, "25000": 25000, "40000": 40000,
    };

    for (const line of lines) {
      const parts = line.split(",").map(s => s.trim());
      if (parts.length < 2) continue;
      const bondNumber = parts[0].replace(/\D/g, "");
      const denomination = denominationMap[parts[1].replace(/\D/g, "")];
      if (!/^\d{6}$/.test(bondNumber) || !denomination) continue;

      const existing = await db.select({ id: bonds.id }).from(bonds).where(
        and(eq(bonds.userId, userId), eq(bonds.bondNumber, bondNumber), eq(bonds.denomination, denomination), isNull(bonds.deletedAt))
      ).get();
      if (existing) continue;

      const bondId = generateId();
      await db.insert(bonds).values({
        id: bondId,
        userId,
        bondNumber,
        denomination,
        status: "active",
        entryMethod: (job.fileType as BondEntryMethod) || "csv",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      saved++;
    }

    await db.update(importJobs).set({ status: "completed", successfulRecords: saved, updatedAt: new Date().toISOString() }).where(eq(importJobs.id, id));
    await logAudit(env, { userId, action: "import.confirm", entityType: "import_job", entityId: id, metadata: { saved }, ipAddress: getClientIp(c) });
    return success(c, { message: `Import completed. ${saved} bonds saved.` });
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
    if (!job) return error(c, "NOT_FOUND", "Import job not found", 404);
    return success(c, job);
  })
  .delete("/imports/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const job = await db.select().from(importJobs).where(and(eq(importJobs.id, id), eq(importJobs.userId, userId))).get();
    if (!job) return error(c, "NOT_FOUND", "Import job not found", 404);
    await db.update(importJobs).set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(importJobs.id, id));
    return success(c, { message: "Import record deleted" });
  });
