import { generateMatchesForDraw } from "../services/matches";
import { sendPendingNotifications } from "../services/notifications";
import { getDb } from "../db";
import { importJobs, auditLogs, notifications, users, bonds, matches, subscriptionHistory, subscriptions } from "../schema";
import { and, eq, isNull, lt } from "drizzle-orm";

export async function handleMatchQueue(env: Env, batch: MessageBatch) {
  for (const message of batch.messages) {
    const { drawId } = message.body as { drawId: string };
    const count = await generateMatchesForDraw(env, drawId);
    message.ack();
  }
}

export async function handleNotificationQueue(env: Env, batch: MessageBatch) {
  const count = await sendPendingNotifications(env);
  for (const message of batch.messages) {
    message.ack();
  }
}

export async function handleCleanupQueue(env: Env, batch: MessageBatch) {
  const db = getDb(env.DB);
  const now = new Date().toISOString();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  await db.update(importJobs).set({ deletedAt: now } as any).where(
    and(isNull(importJobs.deletedAt), lt(importJobs.createdAt, thirtyDaysAgo))
  );

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const expiredDeletions = await db.select().from(users).where(
    and(eq(users.status, "deleted" as any), lt(users.deletedAt!, ninetyDaysAgo))
  ).all();

  for (const user of expiredDeletions) {
    await db.delete(bonds).where(eq(bonds.userId, user.id));
    await db.delete(matches).where(eq(matches.userId, user.id));
    await db.delete(subscriptions).where(eq(subscriptions.userId, user.id));
    await db.delete(subscriptionHistory).where(eq(subscriptionHistory.userId, user.id));
    await db.delete(importJobs).where(eq(importJobs.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
  }

  const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  await db.delete(auditLogs).where(
    and(isNull(auditLogs.userId), lt(auditLogs.createdAt, twelveMonthsAgo))
  );

  for (const message of batch.messages) {
    message.ack();
  }
}

export async function handleDrawQueue(env: Env, batch: MessageBatch) {
  for (const message of batch.messages) {
    const { drawId } = message.body as { drawId: string };
    await generateMatchesForDraw(env, drawId);
    message.ack();
  }
}
