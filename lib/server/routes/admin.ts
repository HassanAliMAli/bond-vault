import { Hono } from "hono";
import { getDb } from "../db";
import {
  users, payments, draws, winningNumbers, auditLogs, systemSettings,
  notifications, plans, subscriptions, subscriptionHistory,
  bonds, matches,
  type PaymentStatus, type NotificationStatus,
} from "../schema";
import { eq, and, or, like, isNull, desc, gte, lte, count, type SQL } from "drizzle-orm";
import { success, error, getEnv } from "../lib";
import { generateId } from "../id";
import { createDrawSchema, createWinningNumberSchema, updateUserSchema, updateSettingsSchema, updateDrawSchema } from "../validations";
import { logAudit, getClientIp, createStorageProvider } from "../services";
import { logger } from "../logger";

type AdminVariables = {
  adminId: string;
};

const isAdmin = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  c: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  next: any,
) => {
  try {
    const auth = c.get("__auth");
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, 401);
    const env = getEnv(c);
    const db = getDb(env.DB);
    const user = await db.select().from(users).where(eq(users.id, session.user.id)).get();
    if (!user || user.status !== "admin") return c.json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } }, 403);
    c.set("adminId", session.user.id);
    await next();
  } catch (e) {
    logger.error("Admin auth error", { message: (e as Error).message });
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, 401);
  }
};

export const adminRoutes = new Hono<{ Bindings: Env; Variables: AdminVariables }>()
  .use("*", isAdmin)

  .get("/admin/users", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const search = c.req.query("search");
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "20")));

    const conditions = [isNull(users.deletedAt)];
    if (search) conditions.push(like(users.email, `%${search}%`));

    const total = (await db.select({ count: users.id }).from(users).where(and(...conditions)).all()).length;
    const data = await db.select().from(users).where(and(...conditions)).limit(limit).offset((page - 1) * limit).all();
    return success(c, { users: data, total });
  })
  .get("/admin/users/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const id = c.req.param("id");
    const user = await db.select().from(users).where(eq(users.id, id)).get();
    if (!user) return error(c, "NOT_FOUND", "User not found", 404);

    const [bondsCount, matchesCount, activeSub] = await Promise.all([
      (await db.select({ count: bonds.id }).from(bonds).where(and(eq(bonds.userId, id), isNull(bonds.deletedAt))).all()).length,
      (await db.select({ count: matches.id }).from(matches).where(eq(matches.userId, id)).all()).length,
      db.select().from(subscriptions).where(and(eq(subscriptions.userId, id), eq(subscriptions.status, "active"))).get(),
    ]);

    return success(c, { ...user, stats: { bondsCount, matchesCount, activeSubscription: !!activeSub } });
  })
  .patch("/admin/users/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const adminId = c.get("adminId");
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);

    await db.update(users).set({ ...parsed.data, updatedAt: new Date().toISOString() }).where(eq(users.id, id));
    await logAudit(env, { userId: adminId, action: "admin.user.update", entityType: "user", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "User updated" });
  })
  .post("/admin/users/:id/suspend", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const adminId = c.get("adminId");
    const id = c.req.param("id");
    await db.update(users).set({ status: "suspended", updatedAt: new Date().toISOString() }).where(eq(users.id, id));
    await logAudit(env, { userId: adminId, action: "admin.user.suspend", entityType: "user", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "User suspended" });
  })
  .post("/admin/users/:id/restore", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const adminId = c.get("adminId");
    const id = c.req.param("id");
    await db.update(users).set({ status: "active", deletedAt: null, updatedAt: new Date().toISOString() }).where(eq(users.id, id));
    await logAudit(env, { userId: adminId, action: "admin.user.restore", entityType: "user", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "User restored" });
  })

  .get("/admin/payments", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const status = (c.req.query("status") || "pending") as PaymentStatus;
    const search = c.req.query("search") || "";
    const page = Math.max(1, Number(c.req.query("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(c.req.query("limit")) || 20));
    const offset = (page - 1) * limit;

    const conditions = [eq(payments.status, status)];
    if (search) {
      conditions.push(
        or(
          like(payments.userId, `%${search}%`),
          like(payments.planId, `%${search}%`),
        )!,
      );
    }

    const data = await db.select().from(payments).where(and(...conditions)).limit(limit).offset(offset).all();
    const countResult = await db.select({ count: count() }).from(payments).where(and(...conditions)).get();
    return success(c, { payments: data, total: countResult?.count ?? 0 });
  })
  .post("/admin/payments/:id/approve", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const adminId = c.get("adminId");
    const id = c.req.param("id");

    const payment = await db.select().from(payments).where(eq(payments.id, id)).get();
    if (!payment) return error(c, "NOT_FOUND", "Payment not found", 404);

    await db.update(payments).set({ status: "approved", reviewedBy: adminId, reviewedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(payments.id, id));

    const plan = await db.select().from(plans).where(eq(plans.id, payment.planId)).get();
    if (plan) {
      const subId = generateId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

      await db.insert(subscriptions).values({
        id: subId,
        userId: payment.userId,
        planId: plan.id,
        status: "active",
        startedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      await db.insert(subscriptionHistory).values({
        id: generateId(),
        userId: payment.userId,
        planId: plan.id,
        amountPaid: payment.amount,
        startedAt: now.toISOString(),
        expiredAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
      });
    }

    await logAudit(env, { userId: adminId, action: "admin.payment.approve", entityType: "payment", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "Payment approved and subscription activated" });
  })
  .post("/admin/payments/:id/reject", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const adminId = c.get("adminId");
    const id = c.req.param("id");
    await db.update(payments).set({ status: "rejected", reviewedBy: adminId, reviewedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(payments.id, id));
    await logAudit(env, { userId: adminId, action: "admin.payment.reject", entityType: "payment", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "Payment rejected" });
  })

  .get("/admin/draws", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const search = c.req.query("search") || "";
    const page = Math.max(1, Number(c.req.query("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(c.req.query("limit")) || 20));
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (search) {
      conditions.push(like(draws.drawNumber, `%${search}%`));
    }

    const data = await db.select().from(draws).where(and(...conditions)).orderBy(desc(draws.drawNumber)).limit(limit).offset(offset).all();
    const countResult = await db.select({ count: count() }).from(draws).where(and(...conditions)).get();
    return success(c, { draws: data, total: countResult?.count ?? 0 });
  })
  .post("/admin/draws", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const adminId = c.get("adminId");
    const body = await c.req.json();
    const parsed = createDrawSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);

    const id = generateId();
    await db.insert(draws).values({
      id,
      denomination: parsed.data.denomination,
      drawNumber: parsed.data.drawNumber,
      drawDate: parsed.data.drawDate,
      source: parsed.data.source || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await logAudit(env, { userId: adminId, action: "admin.draw.create", entityType: "draw", entityId: id, ipAddress: getClientIp(c) });
    return success(c, await db.select().from(draws).where(eq(draws.id, id)).get(), 201);
  })
  .post("/admin/draws/:id/pdf", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const adminId = c.get("adminId");
    const id = c.req.param("id");

    const draw = await db.select().from(draws).where(eq(draws.id, id)).get();
    if (!draw) return error(c, "NOT_FOUND", "Draw not found", 404);

    const formData = await c.req.formData();
    const file = formData.get("pdf") as File | null;
    if (!file) return error(c, "VALIDATION_ERROR", "PDF file is required");

    const buffer = await file.arrayBuffer();
    const storage = createStorageProvider(env);
    const key = `draws/${id}/${file.name}`;
    await storage.upload(key, buffer, file.type);

    await db.update(draws).set({ pdfR2Key: key, updatedAt: new Date().toISOString() }).where(eq(draws.id, id));
    await logAudit(env, { userId: adminId, action: "admin.draw.pdf.upload", entityType: "draw", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "PDF uploaded" });
  })
  .post("/admin/draws/:id/winners", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const adminId = c.get("adminId");
    const drawId = c.req.param("id");

    const draw = await db.select().from(draws).where(eq(draws.id, drawId)).get();
    if (!draw) return error(c, "NOT_FOUND", "Draw not found", 404);

    const body = await c.req.json();
    const winnersData = body.winners || [];

    for (const w of winnersData) {
      const parsed = createWinningNumberSchema.safeParse(w);
      if (!parsed.success) continue;
      const wnId = generateId();
      await db.insert(winningNumbers).values({
        id: wnId,
        drawId,
        bondNumber: parsed.data.bondNumber,
        prizeType: parsed.data.prizeType,
        prizeAmount: parsed.data.prizeAmount,
        createdAt: new Date().toISOString(),
      });
    }

    await logAudit(env, { userId: adminId, action: "admin.draw.winners.create", entityType: "draw", entityId: drawId, ipAddress: getClientIp(c) });
    return success(c, { message: "Winners added" });
  })
  .post("/admin/draws/:id/generate-matches", async (c) => {
    const env = getEnv(c);
    const adminId = c.get("adminId");
    const drawId = c.req.param("id");

    await c.env.MatchGenerationQueue.send({ drawId });
    await logAudit(env, { userId: adminId, action: "admin.draw.matches.generate", entityType: "draw", entityId: drawId, ipAddress: getClientIp(c) });
    return success(c, { message: "Match generation queued" });
  })
  .patch("/admin/draws/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const adminId = c.get("adminId");
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsed = updateDrawSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);

    const draw = await db.select().from(draws).where(eq(draws.id, id)).get();
    if (!draw) return error(c, "NOT_FOUND", "Draw not found", 404);

    await db.update(draws).set({ ...parsed.data, updatedAt: new Date().toISOString() }).where(eq(draws.id, id));
    await logAudit(env, { userId: adminId, action: "admin.draw.update", entityType: "draw", entityId: id, ipAddress: getClientIp(c) });
    return success(c, { message: "Draw updated" });
  })

  .get("/admin/notifications", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const status = c.req.query("status") as NotificationStatus | undefined;
    const conditions: SQL[] = [];
    if (status) conditions.push(eq(notifications.status, status));
    const data = conditions.length > 0
      ? await db.select().from(notifications).where(and(...conditions)).all()
      : await db.select().from(notifications).all();
    return success(c, { notifications: data });
  })
  .post("/admin/notifications/retry", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const adminId = c.get("adminId");
    await db.update(notifications).set({ status: "pending", sentAt: null }).where(eq(notifications.status, "failed"));
    await logAudit(env, { userId: adminId, action: "admin.notifications.retry", entityType: "notification", ipAddress: getClientIp(c) });
    return success(c, { message: "Failed notifications queued for retry" });
  })

  .get("/admin/audit-logs", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = c.req.query("userId");
    const entityType = c.req.query("entityType");
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "50")));

    const conditions: SQL[] = [];
    if (userId) conditions.push(eq(auditLogs.userId, userId));
    if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
    if (startDate) conditions.push(gte(auditLogs.createdAt, startDate));
    if (endDate) conditions.push(lte(auditLogs.createdAt, endDate));

    const total = (await db.select({ count: auditLogs.id }).from(auditLogs).where(and(...conditions)).all()).length;
    const data = await db.select().from(auditLogs).where(and(...conditions)).limit(limit).offset((page - 1) * limit).orderBy(desc(auditLogs.createdAt)).all();
    return success(c, { logs: data, total });
  })

  .get("/admin/settings", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const data = await db.select().from(systemSettings).all();
    return success(c, { settings: data });
  })
  .patch("/admin/settings", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const adminId = c.get("adminId");
    const body = await c.req.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);

    const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, parsed.data.key)).get();
    if (existing) {
      await db.update(systemSettings).set({ value: parsed.data.value, updatedAt: new Date().toISOString() }).where(eq(systemSettings.key, parsed.data.key));
    } else {
      await db.insert(systemSettings).values({ key: parsed.data.key, value: parsed.data.value, updatedAt: new Date().toISOString() });
    }

    await logAudit(env, { userId: adminId, action: "admin.settings.update", entityType: "system_settings", entityId: parsed.data.key, ipAddress: getClientIp(c) });
    return success(c, { message: "Setting updated" });
  })

  .get("/admin/dashboard", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const [totalUsers, totalBonds, totalMatches, pendingPayments, activeSubs] = await Promise.all([
      (await db.select({ count: users.id }).from(users).where(isNull(users.deletedAt)).all()).length,
      (await db.select({ count: bonds.id }).from(bonds).where(isNull(bonds.deletedAt)).all()).length,
      (await db.select({ count: matches.id }).from(matches).all()).length,
      (await db.select({ count: payments.id }).from(payments).where(eq(payments.status, "pending")).all()).length,
      (await db.select({ count: subscriptions.id }).from(subscriptions).where(eq(subscriptions.status, "active")).all()).length,
    ]);
    return success(c, { stats: { totalUsers, totalBonds, totalMatches, pendingPayments, activeSubscriptions: activeSubs } });
  });
