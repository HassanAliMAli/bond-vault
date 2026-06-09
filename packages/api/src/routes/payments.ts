import { Hono } from "hono";
import { getDb } from "../db";
import { payments, paymentReceipts, plans } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware";
import { success, error } from "../lib/response";
import { paymentSchema } from "../validations";
import { generateId } from "../lib/id";
import { getUserId, getEnv } from "../lib/context";

export const paymentRoutes = new Hono()
  .use(authMiddleware)
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
      status: "pending" as any,
    } as any);

    return success(c, { paymentId: id, amount: plan.priceUsd, status: "pending" }, 201);
  })
  .post("/payments/:id/receipt", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const paymentId = c.req.param("id");

    const payment = await db.select().from(payments).where(eq(payments.id, paymentId)).get();
    if (!payment || payment.userId !== userId) return error(c, "NOT_FOUND", "Payment not found", 404);

    const formData = await c.req.formData();
    const file = formData.get("receipt") as unknown as File | null;
    if (!file) return error(c, "VALIDATION_ERROR", "Receipt file required");

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const existingHash = await db.select({ id: paymentReceipts.id }).from(paymentReceipts).where(eq(paymentReceipts.hash, hash)).get();
    if (existingHash) return error(c, "CONFLICT", "Duplicate receipt detected", 409);

    const key = `receipts/${userId}/${paymentId}_${Date.now()}`;
    await env.R2.put(key, buffer);

    await db.insert(paymentReceipts).values({
      id: generateId(),
      paymentId,
      r2FileKey: key,
      hash,
    } as any);

    return success(c, { message: "Receipt uploaded", paymentId });
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
    const payment = await db.select().from(payments).where(eq(payments.id, id)).get();
    if (!payment || payment.userId !== userId) return error(c, "NOT_FOUND", "Payment not found", 404);
    return success(c, payment);
  });
