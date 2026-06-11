import { Hono } from "hono";
import { getDb } from "../db";
import { users, notificationPreferences, userPreferences, subscriptions, subscriptionHistory, plans } from "../schema";
import { eq } from "drizzle-orm";
import { success, error, getUserId, getEnv } from "../lib";
import { notificationPrefsSchema, updateProfileSchema } from "../validations";

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
    await db.update(users).set({ ...parsed.data, updatedAt: new Date().toISOString() } as any).where(eq(users.id, userId));
    return success(c, await db.select().from(users).where(eq(users.id, userId)).get());
  });

export const notificationRoutes = new Hono()
  .get("/notifications/preferences", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const prefs = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).get();
    return success(c, prefs);
  })
  .patch("/notifications/preferences", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const body = await c.req.json();
    const parsed = notificationPrefsSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.issues[0].message);
    await db.update(notificationPreferences).set({ ...parsed.data, updatedAt: new Date().toISOString() } as any).where(eq(notificationPreferences.userId, userId));
    return success(c, await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).get());
  });

export const subscriptionRoutes = new Hono()
  .get("/subscription/current", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const sub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).get();
    return success(c, sub || null);
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
