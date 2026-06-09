import { Hono } from "hono";
import { getDb } from "../db";
import { notifications, notificationPreferences } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware";
import { success, error } from "../lib/response";
import { notificationPrefsSchema } from "../validations";
import { getUserId, getEnv } from "../lib/context";

export const notificationRoutes = new Hono()
  .use(authMiddleware)
  .get("/notifications", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const data = await db.select().from(notifications).where(eq(notifications.userId, userId)).all();
    return success(c, { notifications: data });
  })
  .get("/notifications/:id", async (c) => {
    const env = getEnv(c);
    const db = getDb(env.DB);
    const userId = getUserId(c);
    const id = c.req.param("id");
    const notif = await db.select().from(notifications).where(eq(notifications.id, id)).get();
    if (!notif || notif.userId !== userId) return error(c, "NOT_FOUND", "Notification not found", 404);
    await db.update(notifications).set({ readAt: new Date().toISOString() } as any).where(eq(notifications.id, id));
    return success(c, notif);
  })
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
    const updated = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).get();
    return success(c, updated);
  });
