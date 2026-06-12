import { getDb } from "../db";
import { subscriptions, plans } from "../schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { ocrUsage } from "../schema";

async function getActiveSubscription(env: Env, userId: string) {
  const db = getDb(env.DB);
  const now = new Date().toISOString();
  const sub = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active" as any),
        lte(subscriptions.startedAt, now),
        gte(subscriptions.expiresAt, now)
      )
    )
    .get();
  if (!sub) return null;
  const plan = await db
    .select()
    .from(plans)
    .where(eq(plans.id, sub.planId))
    .get();
  return { subscription: sub, plan };
}

export async function canImport(env: Env, userId: string): Promise<boolean> {
  const active = await getActiveSubscription(env, userId);
  return active?.plan?.importsEnabled === true;
}

export async function canExport(env: Env, userId: string): Promise<boolean> {
  const active = await getActiveSubscription(env, userId);
  return active?.plan?.exportsEnabled === true;
}

export async function canReceiveAlerts(env: Env, userId: string): Promise<boolean> {
  const active = await getActiveSubscription(env, userId);
  return active?.plan?.alertsEnabled === true;
}

export async function canAutoMonitor(env: Env, userId: string): Promise<boolean> {
  const active = await getActiveSubscription(env, userId);
  return active?.plan?.autoMonitoringEnabled === true;
}

export async function getOcrUsage(env: Env, userId: string): Promise<{ used: number; remaining: number; limit: number }> {
  const db = getDb(env.DB);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const usage = await db
    .select()
    .from(ocrUsage)
    .where(
      and(
        eq(ocrUsage.userId, userId),
        eq(ocrUsage.year, year),
        eq(ocrUsage.month, month)
      )
    )
    .get();

  const active = await getActiveSubscription(env, userId);
  const limit = active?.plan?.ocrLimit ?? 3;
  const used = usage?.successfulScans ?? 0;
  return { used, remaining: Math.max(0, limit - used), limit };
}

export async function canUseOcr(env: Env, userId: string): Promise<boolean> {
  const { remaining } = await getOcrUsage(env, userId);
  return remaining > 0;
}
