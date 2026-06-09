import { getDb } from "../db";
import { plans } from "../db/schema";
import { generateId } from "../lib/id";

export const DEFAULT_PLANS = [
  {
    name: "Free",
    priceUsd: 0,
    durationDays: 0,
    ocrLimit: 3,
    importsEnabled: false,
    alertsEnabled: false,
    exportsEnabled: false,
    autoMonitoringEnabled: false,
  },
  {
    name: "Monthly",
    priceUsd: 4.99,
    durationDays: 30,
    ocrLimit: 30,
    importsEnabled: true,
    alertsEnabled: true,
    exportsEnabled: true,
    autoMonitoringEnabled: true,
  },
  {
    name: "Quarterly",
    priceUsd: 12.99,
    durationDays: 90,
    ocrLimit: 100,
    importsEnabled: true,
    alertsEnabled: true,
    exportsEnabled: true,
    autoMonitoringEnabled: true,
  },
  {
    name: "Semi Annual",
    priceUsd: 22.99,
    durationDays: 180,
    ocrLimit: 250,
    importsEnabled: true,
    alertsEnabled: true,
    exportsEnabled: true,
    autoMonitoringEnabled: true,
  },
  {
    name: "Annual",
    priceUsd: 39.99,
    durationDays: 365,
    ocrLimit: 500,
    importsEnabled: true,
    alertsEnabled: true,
    exportsEnabled: true,
    autoMonitoringEnabled: true,
  },
];

export async function seedPlans(d1: D1Database) {
  const db = getDb(d1);
  const existing = await db.select().from(plans).all();
  if (existing.length > 0) {
    console.log(`${existing.length} plans already seeded, skipping`);
    return;
  }

  for (const plan of DEFAULT_PLANS) {
    await db.insert(plans).values({
      id: generateId(),
      ...plan,
    } as any);
  }
  console.log(`Seeded ${DEFAULT_PLANS.length} plans`);
}
