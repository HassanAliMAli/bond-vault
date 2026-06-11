import { getDb } from "../db";
import { subscriptions } from "../schema";
import { eq, and, lt } from "drizzle-orm";

export async function handleSubscriptionExpiration(env: Env): Promise<number> {
  const db = getDb(env.DB);
  const now = new Date().toISOString();
  const expired = await db.select().from(subscriptions).where(and(eq(subscriptions.status, "active" as any), lt(subscriptions.expiresAt, now))).all();

  let count = 0;
  for (const sub of expired) {
    const graceEndsAt = new Date(new Date(sub.expiresAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    if (now < graceEndsAt) {
      await db.update(subscriptions).set({ status: "grace_period" as any, graceEndsAt, updatedAt: now } as any).where(eq(subscriptions.id, sub.id));
    } else {
      await db.update(subscriptions).set({ status: "expired" as any, updatedAt: now } as any).where(eq(subscriptions.id, sub.id));
    }
    count++;
  }
  return count;
}
