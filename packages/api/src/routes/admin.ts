import { Hono } from "hono";
import { getDb } from "../db";
import {
  users, bonds, payments, subscriptionHistory, subscriptions, plans,
  draws as drawsTable, winningNumbers, matches, auditLogs, systemSettings,
  notificationBatches, notifications
} from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { adminMiddleware, sessionMiddleware } from "../middleware";
import { success, error } from "../lib/response";
import { generateId } from "../lib/id";

export const adminRoutes = new Hono()
  .use(sessionMiddleware, adminMiddleware)
  .get("/users", async (c) => {
    const db = getDb((c.env as Env).DB);
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "50");
    const data = await db.select().from(users).limit(limit).offset((page - 1) * limit).all();
    return success(c, { users: data, total: data.length });
  })
  .get("/users/:id", async (c) => {
    const db = getDb((c.env as Env).DB);
    const id = c.req.param("id");
    const user = await db.select().from(users).where(eq(users.id, id)).get();
    if (!user) return error(c, "NOT_FOUND", "User not found", 404);
    return success(c, user);
  })
  .patch("/users/:id", async (c) => {
    const db = getDb((c.env as Env).DB);
    const id = c.req.param("id");
    const body = await c.req.json();
    await db.update(users).set(body as any).where(eq(users.id, id));
    const updated = await db.select().from(users).where(eq(users.id, id)).get();
    return success(c, updated);
  })
  .post("/users/:id/suspend", async (c) => {
    const db = getDb((c.env as Env).DB);
    const id = c.req.param("id");
    await db.update(users).set({ status: "suspended" as any, updatedAt: new Date().toISOString() } as any).where(eq(users.id, id));
    return success(c, { message: "User suspended" });
  })
  .post("/users/:id/restore", async (c) => {
    const db = getDb((c.env as Env).DB);
    const id = c.req.param("id");
    await db.update(users).set({ status: "active" as any, deletedAt: null, updatedAt: new Date().toISOString() } as any).where(eq(users.id, id));
    return success(c, { message: "User restored" });
  })
  .get("/payments", async (c) => {
    const db = getDb((c.env as Env).DB);
    const status = c.req.query("status") || "pending";
    const data = await db.select().from(payments).where(eq(payments.status, status as any)).all();
    return success(c, { payments: data });
  })
  .post("/payments/:id/approve", async (c) => {
    const db = getDb((c.env as Env).DB);
    const id = c.req.param("id");

    const payment = await db.select().from(payments).where(eq(payments.id, id)).get();
    if (!payment) return error(c, "NOT_FOUND", "Payment not found", 404);

    await db.update(payments).set({
      status: "approved" as any,
      reviewedBy: "admin",
      reviewedAt: new Date().toISOString(),
    } as any).where(eq(payments.id, id));

    const plan = await db.select().from(plans).get();
    if (plan) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
      const graceEndsAt = new Date(expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000);

      const existingSub = await db.select().from(subscriptions).where(eq(subscriptions.userId, payment.userId)).get();
      if (existingSub) {
        await db.update(subscriptions).set({
          planId: plan.id,
          status: "active" as any,
          startedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          graceEndsAt: graceEndsAt.toISOString(),
          updatedAt: now.toISOString(),
        } as any).where(eq(subscriptions.id, existingSub.id));
      } else {
        await db.insert(subscriptions).values({
          id: generateId(),
          userId: payment.userId,
          planId: plan.id,
          status: "active" as any,
          startedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          graceEndsAt: graceEndsAt.toISOString(),
        } as any);
      }

      await db.insert(subscriptionHistory).values({
        id: generateId(),
        userId: payment.userId,
        planId: plan.id,
        amountPaid: payment.amount,
        startedAt: now.toISOString(),
        expiredAt: expiresAt.toISOString(),
      } as any);
    }

    return success(c, { message: "Payment approved, subscription activated" });
  })
  .post("/payments/:id/reject", async (c) => {
    const db = getDb((c.env as Env).DB);
    const id = c.req.param("id");
    await db.update(payments).set({
      status: "rejected" as any,
      reviewedBy: "admin",
      reviewedAt: new Date().toISOString(),
    } as any).where(eq(payments.id, id));
    return success(c, { message: "Payment rejected" });
  })
  .post("/draws", async (c) => {
    const db = getDb((c.env as Env).DB);
    const body = await c.req.json();
    const { denomination, drawNumber, drawDate } = body as { denomination: number; drawNumber: string; drawDate: string };

    if (!denomination || !drawDate) {
      return error(c, "VALIDATION_ERROR", "Denomination and draw date are required");
    }

    const id = generateId();
    await db.insert(drawsTable).values({ id, denomination, drawNumber, drawDate } as any);
    return success(c, { drawId: id }, 201);
  })
  .post("/draws/:id/pdf", async (c) => {
    const db = getDb((c.env as Env).DB);
    const id = c.req.param("id");
    const formData = await c.req.formData();
    const file = formData.get("pdf") as unknown as File | null;

    if (!file) return error(c, "VALIDATION_ERROR", "PDF file required");

    const buffer = await file.arrayBuffer();
    const key = `draws/${id}_${Date.now()}.pdf`;
    await (c.env as Env).R2.put(key, buffer);

    await db.update(drawsTable).set({ pdfR2Key: key, updatedAt: new Date().toISOString() } as any).where(eq(drawsTable.id, id));
    return success(c, { message: "PDF uploaded", key });
  })
  .post("/draws/:id/winners", async (c) => {
    const db = getDb((c.env as Env).DB);
    const id = c.req.param("id");
    const body = await c.req.json();
    const { winners } = body as { winners: { bondNumber: string; prizeType?: string; prizeAmount?: number }[] };

    if (!Array.isArray(winners)) return error(c, "VALIDATION_ERROR", "Winners array required");

    let inserted = 0;
    for (const w of winners) {
      if (!/^\d{6}$/.test(w.bondNumber)) continue;
      await db.insert(winningNumbers).values({
        id: generateId(),
        drawId: id,
        bondNumber: w.bondNumber,
        prizeType: w.prizeType || "3rd Prize",
        prizeAmount: w.prizeAmount || 0,
      } as any);
      inserted++;
    }

    return success(c, { inserted });
  })
  .patch("/draws/:id", async (c) => {
    const db = getDb((c.env as Env).DB);
    const id = c.req.param("id");
    const body = await c.req.json();
    await db.update(drawsTable).set(body as any).where(eq(drawsTable.id, id));
    return success(c, { message: "Draw updated" });
  })
  .post("/draws/:id/generate-matches", async (c) => {
    const db = getDb((c.env as Env).DB);
    const drawId = c.req.param("id");

    const draw = await db.select().from(drawsTable).where(eq(drawsTable.id, drawId)).get();
    if (!draw) return error(c, "NOT_FOUND", "Draw not found", 404);

    const winners = await db.select().from(winningNumbers).where(eq(winningNumbers.drawId, drawId)).all();
    const allBonds = await db.select().from(bonds).where(eq(bonds.status, "active" as any));

    let matchCount = 0;
    const userMatches = new Map<string, number>();

    for (const bond of allBonds) {
      const winner = winners.find(w => w.bondNumber === bond.bondNumber);
      if (winner) {
        await db.insert(matches).values({
          id: generateId(),
          userId: bond.userId,
          bondId: bond.id,
          winningNumberId: winner.id,
          drawId,
          bondNumberSnapshot: bond.bondNumber,
          denominationSnapshot: bond.denomination,
          prizeTypeSnapshot: winner.prizeType,
          prizeAmountSnapshot: winner.prizeAmount,
          drawDateSnapshot: draw.drawDate,
          status: "unseen" as any,
        } as any);
        matchCount++;
        userMatches.set(bond.userId, (userMatches.get(bond.userId) || 0) + 1);
      }
    }

    for (const [userId, count] of userMatches) {
      const batchId = generateId();
      await db.insert(notificationBatches).values({
        id: batchId,
        userId,
        channel: "email",
        matchCount: count,
        status: "pending" as any,
      } as any);
      await db.insert(notifications).values({
        id: generateId(),
        userId,
        batchId,
        channel: "email",
        title: "Winning Bonds Alert",
        message: `You have ${count} winning bonds in the latest draw.`,
        status: "pending" as any,
      } as any);
    }

    return success(c, { matchCount, usersNotified: userMatches.size });
  })
  .get("/notifications", async (c) => {
    const db = getDb((c.env as Env).DB);
    const data = await db.select().from(notificationBatches).all();
    return success(c, { batches: data });
  })
  .post("/notifications/retry", async (c) => {
    const db = getDb((c.env as Env).DB);
    await db.update(notificationBatches).set({ status: "pending" as any } as any).where(eq(notificationBatches.status, "failed" as any));
    return success(c, { message: "Retry triggered for failed batches" });
  })
  .get("/audit-logs", async (c) => {
    const db = getDb((c.env as Env).DB);
    const userFilter = c.req.query("user");
    const entityFilter = c.req.query("entity");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "100");

    let query = db.select().from(auditLogs).$dynamic();
    if (userFilter) query = query.where(eq(auditLogs.userId, userFilter));
    if (entityFilter) query = query.where(eq(auditLogs.entityType, entityFilter));

    const data = await query.orderBy(desc(auditLogs.createdAt)).limit(limit).offset((page - 1) * limit).all();
    return success(c, { logs: data, total: data.length });
  })
  .get("/settings", async (c) => {
    const db = getDb((c.env as Env).DB);
    const settings = await db.select().from(systemSettings).all();
    return success(c, { settings });
  })
  .patch("/settings", async (c) => {
    const db = getDb((c.env as Env).DB);
    const body = await c.req.json();
    for (const [key, value] of Object.entries(body)) {
      await db.insert(systemSettings).values({ key, value: String(value) } as any).onConflictDoUpdate({
        target: systemSettings.key,
        set: { value: String(value), updatedAt: new Date().toISOString() } as any,
      });
    }
    return success(c, { message: "Settings updated" });
  });
