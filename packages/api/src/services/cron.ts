import { getDb } from "../db";
import {
  subscriptions, users, importJobs, notificationBatches,
} from "../db/schema";
import { eq, and, lt, isNull } from "drizzle-orm";

export async function handleSubscriptionExpiration(env: Env): Promise<number> {
  const db = getDb(env.DB);
  const now = new Date().toISOString();

  const expired = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, "active"),
        lt(subscriptions.expiresAt, now)
      )
    )
    .all();

  let count = 0;
  for (const sub of expired) {
    const graceEndsAt = new Date(
      new Date(sub.expiresAt).getTime() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    if (now < graceEndsAt) {
      await db
        .update(subscriptions)
        .set({ status: "grace_period", graceEndsAt, updatedAt: now } as any)
        .where(eq(subscriptions.id, sub.id));
    } else {
      await db
        .update(subscriptions)
        .set({ status: "expired", updatedAt: now } as any)
        .where(eq(subscriptions.id, sub.id));
    }
    count++;
  }

  return count;
}

export async function handleRetentionCleanup(env: Env): Promise<number> {
  const db = getDb(env.DB);
  const ninetyDaysAgo = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000
  ).toISOString();

  const deleted = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.status, "deleted"),
        lt(users.deletedAt ?? "", ninetyDaysAgo)
      )
    )
    .all();

  for (const u of deleted) {
    await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(u.id).run();
  }

  return deleted.length;
}

export async function handleImportCleanup(env: Env): Promise<number> {
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const old = await getDb(env.DB)
    .select({ id: importJobs.id, r2FileKey: importJobs.r2FileKey })
    .from(importJobs)
    .where(lt(importJobs.createdAt, thirtyDaysAgo))
    .all();

  let count = 0;
  for (const job of old) {
    if (job.r2FileKey) {
      await env.R2.delete(job.r2FileKey);
    }
    await getDb(env.DB)
      .delete(importJobs)
      .where(eq(importJobs.id, job.id));
    count++;
  }

  return count;
}

export async function handleFailedNotificationRetry(env: Env): Promise<number> {
  const db = getDb(env.DB);
  const failed = await db
    .select()
    .from(notificationBatches)
    .where(eq(notificationBatches.status, "failed" as any))
    .all();

  for (const batch of failed) {
    await db
      .update(notificationBatches)
      .set({ status: "pending" as any } as any)
      .where(eq(notificationBatches.id, batch.id));
  }

  return failed.length;
}
