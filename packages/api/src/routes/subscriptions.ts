import { Hono } from "hono";
import { getDb } from "../db";
import { subscriptions, subscriptionHistory, plans } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware";
import { success } from "../lib/response";
import { getUserId, getEnv } from "../lib/context";

export const subscriptionRoutes = new Hono()
  .use(authMiddleware)
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
