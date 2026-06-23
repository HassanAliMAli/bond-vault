import { getDb } from "../db";
import { plans } from "../schema";
import { eq } from "drizzle-orm";
import { generateId } from "../id";

const DEFAULT_PLANS = [
  { name: "Free", priceUsd: 0, durationDays: 0, ocrLimit: 3, importsEnabled: false, alertsEnabled: false, exportsEnabled: false, autoMonitoringEnabled: false },
  { name: "Monthly", priceUsd: 10, durationDays: 30, ocrLimit: 30, importsEnabled: true, alertsEnabled: true, exportsEnabled: true, autoMonitoringEnabled: true },
  { name: "Quarterly", priceUsd: 25, durationDays: 90, ocrLimit: 100, importsEnabled: true, alertsEnabled: true, exportsEnabled: true, autoMonitoringEnabled: true },
  { name: "Semi Annual", priceUsd: 50, durationDays: 180, ocrLimit: 250, importsEnabled: true, alertsEnabled: true, exportsEnabled: true, autoMonitoringEnabled: true },
  { name: "Annual", priceUsd: 100, durationDays: 365, ocrLimit: 500, importsEnabled: true, alertsEnabled: true, exportsEnabled: true, autoMonitoringEnabled: true },
];

export async function seedPlans(d1: D1Database) {
  const db = getDb(d1);
  for (const plan of DEFAULT_PLANS) {
    const existing = await db.select().from(plans).where(eq(plans.name, plan.name)).get();
    if (existing) {
      await db.update(plans).set({ ...plan, updatedAt: new Date().toISOString() }).where(eq(plans.id, existing.id));
    } else {
      await db.insert(plans).values({ id: generateId(), ...plan });
    }
  }
}
