import { Hono } from "hono";
import { getDb } from "../db";
import { payments, paymentReceipts } from "../schema";
import { eq, and } from "drizzle-orm";
import { success, error, getUserId, getEnv } from "../lib";
import { paymentSchema } from "../validations";
import { generateId } from "../id";
import { logAudit, getClientIp, createStorageProvider } from "../services";

export const paymentRoutes = new Hono()
  .post("/payments", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const body = await c.req.json();
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);

    const plan = await db.select().from(plans).where(eq(plans.id, parsed.data.planId)).get();
    if (!plan) return error(c, "NOT_FOUND", "Plan not found", 404);

    const id = generateId();
    await db.insert(payments).values({
      id,
      userId,
      amount: plan.priceUsd,
      paymentMethod: null,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await logAudit(env, { userId, action: "payment.create", entityType: "payment", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { paymentId: id, amount: plan.priceUsd, status: "pending" }, 201);
  })
  .get("/payments", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const data = await db.select().from(payments).where(eq(payments.userId, userId)).all();
    return success(c, { payments: data });
  })
  .get("/payments/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const payment = await db.select().from(payments).where(and(eq(payments.id, id), eq(payments.userId, userId))).get();
    if (!payment) return error(c, "NOT_FOUND", "Payment not found", 404);
    return success(c, payment);
  })
  .post("/payments/:id/receipt", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");

    const payment = await db.select().from(payments).where(and(eq(payments.id, id), eq(payments.userId, userId))).get();
    if (!payment) return error(c, "NOT_FOUND", "Payment not found", 404);
    if (payment.status !== "pending") return error(c, "BAD_REQUEST", "Payment is not pending", 400);

    const formData = await c.req.formData();
    const file = formData.get("receipt") as File | null;
    if (!file) return error(c, "VALIDATION_ERROR", "Receipt file is required");

    const buffer = await file.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", buffer).then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join(""));

    const existingReceipt = await db.select().from(paymentReceipts).where(eq(paymentReceipts.hash, hash)).get();
    if (existingReceipt) return error(c, "CONFLICT", "Duplicate receipt detected", 409);

    const storage = createStorageProvider(env);
    const key = `receipts/${userId}/${id}_${file.name}`;
    await storage.upload(key, buffer, file.type);

    const receiptId = generateId();
    await db.insert(paymentReceipts).values({
      id: receiptId,
      paymentId: id,
      r2FileKey: key,
      hash,
      createdAt: new Date().toISOString(),
    });

    await logAudit(env, { userId, action: "payment.receipt.upload", entityType: "payment", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "Receipt uploaded", paymentId: id });
  });
