import { Hono } from "hono";
import { getDb } from "../db";
import { users, notificationPreferences, userPreferences, subscriptions, subscriptionHistory, plans, notifications } from "../schema";
import { eq, and, isNull } from "drizzle-orm";
import { success, error, getUserId, getEnv } from "../lib";
import { notificationPrefsSchema, updateProfileSchema } from "../validations";
import { logAudit, getClientIp, canImport, canExport } from "../services";

export const userRoutes = new Hono()
  .get("/profile", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) return error(c, "NOT_FOUND", "User not found", 404);
    return success(c, { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, whatsappNumber: user.whatsappNumber, status: user.status });
  })
  .patch("/profile", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const body = await c.req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);
    await db.update(users).set({ ...parsed.data, updatedAt: new Date().toISOString() }).where(eq(users.id, userId));
    await logAudit(env, { userId, action: "user.profile.update", entityType: "user", entityId: userId, ipAddress: getClientIp(c) });
    return success(c, await db.select().from(users).where(eq(users.id, userId)).get());
  })
  .delete("/account", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    await db.update(users).set({ status: "deleted", deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(users.id, userId));
    await logAudit(env, { userId, action: "user.account.delete", entityType: "user", entityId: userId, ipAddress: getClientIp(c) });
    return success(c, { message: "Account deletion requested. Data will be permanently deleted after 90 days." });
  })
  .get("/permissions", async (c) => {
    const env = getEnv(c);
    const userId = getUserId(c);
    const [importEnabled, exportEnabled] = await Promise.all([
      canImport(env, userId),
      canExport(env, userId),
    ]);
    return success(c, { canImport: importEnabled, canExport: exportEnabled });
  });

export const notificationRoutes = new Hono()
  .get("/notifications", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query("limit") || "20")));
    const total = (await db.select({ count: notifications.id }).from(notifications).where(eq(notifications.userId, userId)).all()).length;
    const data = await db.select().from(notifications).where(eq(notifications.userId, userId)).limit(limit).offset((page - 1) * limit).all();
    return success(c, { notifications: data, total });
  })
  .get("/notifications/preferences", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    let prefs = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).get();
    if (!prefs) {
      const id = (await import("../id")).generateId();
      await db.insert(notificationPreferences).values({ id, userId, emailEnabled: true, whatsappEnabled: false, smsEnabled: false });
      prefs = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).get();
    }
    return success(c, prefs);
  })
  .patch("/notifications/preferences", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const body = await c.req.json();
    const parsed = notificationPrefsSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);
    const prefs = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).get();
    if (!prefs) {
      const id = (await import("../id")).generateId();
      await db.insert(notificationPreferences).values({ id, userId, ...parsed.data, emailEnabled: parsed.data.emailEnabled ?? true, whatsappEnabled: parsed.data.whatsappEnabled ?? false, smsEnabled: parsed.data.smsEnabled ?? false });
    } else {
      await db.update(notificationPreferences).set({ ...parsed.data, updatedAt: new Date().toISOString() }).where(eq(notificationPreferences.userId, userId));
    }
    await logAudit(env, { userId, action: "notification.preferences.update", entityType: "user", entityId: userId, ipAddress: getClientIp(c) });
    return success(c, await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).get());
  });

export const subscriptionRoutes = new Hono()
  .get("/subscription/current", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const sub = await db.select().from(subscriptions).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))).get();
    if (!sub) {
      const graceSub = await db.select().from(subscriptions).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "grace_period"))).get();
      return success(c, graceSub || null);
    }
    return success(c, sub);
  })
  .get("/subscription/history", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const history = await db.select().from(subscriptionHistory).where(eq(subscriptionHistory.userId, userId)).all();
    return success(c, { history });
  })
  .get("/plans", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const allPlans = await db.select().from(plans).all();
    return success(c, { plans: allPlans });
  });

export const notificationRoutesExport = notificationRoutes;
