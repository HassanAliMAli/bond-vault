import { getDb } from "../db";
import { users, bonds, matches, subscriptions, subscriptionHistory, importJobs, auditLogs } from "../schema";
import { eq, and, isNull, lt, or } from "drizzle-orm";

export async function handleRetentionCleanup(env: Env): Promise<{ deletedUsers: number; cleanedImports: number; cleanedAuditLogs: number }> {
  const db = getDb(env.DB);
  const now = new Date().toISOString();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const importedDeleted = await db.update(importJobs).set({ deletedAt: now } as any).where(
    and(isNull(importJobs.deletedAt), lt(importJobs.createdAt, thirtyDaysAgo))
  );

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const expiredUsers = await db.select().from(users).where(
    and(eq(users.status, "deleted" as any), lt(users.deletedAt!, ninetyDaysAgo))
  ).all();

  for (const user of expiredUsers) {
    await db.delete(bonds).where(eq(bonds.userId, user.id));
    await db.delete(matches).where(eq(matches.userId, user.id));
    await db.delete(subscriptions).where(eq(subscriptions.userId, user.id));
    await db.delete(subscriptionHistory).where(eq(subscriptionHistory.userId, user.id));
    await db.delete(importJobs).where(eq(importJobs.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
  }

  const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const auditDeleted = await db.delete(auditLogs).where(
    and(isNull(auditLogs.userId), lt(auditLogs.createdAt, twelveMonthsAgo))
  );

  return {
    deletedUsers: expiredUsers.length,
    cleanedImports: importedDeleted.meta.changes || 0,
    cleanedAuditLogs: auditDeleted.meta.changes || 0,
  };
}

export async function handleImportCleanup(env: Env): Promise<number> {
  const db = getDb(env.DB);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const result = await db.update(importJobs).set({ deletedAt: new Date().toISOString() } as any).where(
    and(isNull(importJobs.deletedAt), lt(importJobs.createdAt, thirtyDaysAgo))
  );
  return result.meta.changes || 0;
}
