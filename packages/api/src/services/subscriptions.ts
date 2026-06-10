import { getDb } from "../db";
import { subscriptions, plans } from "../db/schema";
import { eq, and, gte } from "drizzle-orm";

export type FeatureGate =
  | "ocr"
  | "imports"
  | "alerts"
  | "exports"
  | "autoMonitoring";

export async function getUserPlan(d1: D1Database, userId: string) {
  const db = getDb(d1);
  const sub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .get();

  if (!sub) return null;

  const plan = await db
    .select()
    .from(plans)
    .where(eq(plans.id, sub.planId))
    .get();

  return { subscription: sub, plan };
}

export async function canUserAccess(d1: D1Database, userId: string, gate: FeatureGate): Promise<boolean> {
  const result = await getUserPlan(d1, userId);
  if (!result) return gate === "ocr"; // Only free OCR works for unsubscribed users

  const { subscription, plan } = result;
  if (!plan) return gate === "ocr";

  const now = new Date().toISOString();
  const graceEndsAt = subscription.graceEndsAt ?? "1970-01-01";

  // Active subscriptions and grace period users get full access
  if (subscription.status === "active" || (subscription.status === "grace_period" && now < graceEndsAt)) {
    switch (gate) {
      case "ocr": return plan.ocrLimit > 0;
      case "imports": return plan.importsEnabled;
      case "alerts": return plan.alertsEnabled;
      case "exports": return plan.exportsEnabled;
      case "autoMonitoring": return plan.autoMonitoringEnabled;
    }
  }

  // Free tier fallback
  return gate === "ocr";
}

export async function getOcrRemaining(d1: D1Database, userId: string): Promise<number> {
  const result = await getUserPlan(d1, userId);
  if (!result?.plan) return 3;
  return result.plan.ocrLimit;
}

export function isGracePeriodActive(subscription: { status: string; graceEndsAt: string | null }): boolean {
  if (subscription.status !== "grace_period" || !subscription.graceEndsAt) return false;
  return new Date().toISOString() < subscription.graceEndsAt;
}
