/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  canImport,
  canExport,
  canReceiveAlerts,
  canAutoMonitor,
  getOcrUsage,
  canUseOcr,
} from "@/lib/server/services/feature-gates";

vi.mock("@/lib/server/db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "@/lib/server/db";
const mockGetDb = getDb as ReturnType<typeof vi.fn>;

function setupDb() {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    get: vi.fn(),
    all: vi.fn(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
  };

  const mockDb = {
    select: vi.fn().mockReturnValue(chain),
    insert: vi.fn().mockReturnValue({ values: vi.fn() }),
    update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn() }) }),
  };

  mockGetDb.mockReturnValue(mockDb);
  return { mockDb, chain };
}

const mockEnv = { DB: {}, KV: {}, R2: {}, BETTER_AUTH_SECRET: "test", ENVIRONMENT: "test" } as any;

describe("getOcrUsage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns free tier (limit=3, used=0) when no subscription or OCR data", async () => {
    const { chain } = setupDb();
    chain.get.mockResolvedValueOnce(undefined); // OCR usage query → no data
    chain.get.mockResolvedValueOnce(undefined); // subscription query → no active sub

    const result = await getOcrUsage(mockEnv, "user_free");

    expect(result).toEqual({ used: 0, remaining: 3, limit: 3 });
  });

  it("returns usage from OCR records when no subscription", async () => {
    const { chain } = setupDb();
    chain.get.mockResolvedValueOnce({ successfulScans: 2 }); // OCR usage → 2 scans
    chain.get.mockResolvedValueOnce(undefined); // subscription → no active sub

    const result = await getOcrUsage(mockEnv, "user_with_scans");

    expect(result).toEqual({ used: 2, remaining: 1, limit: 3 });
  });

  it("uses plan limit when active subscription exists", async () => {
    const { chain } = setupDb();
    chain.get.mockResolvedValueOnce(undefined); // OCR usage → no scans
    chain.get.mockResolvedValueOnce({ id: "sub1", planId: "plan_monthly", status: "active" }); // subscription
    chain.get.mockResolvedValueOnce({ id: "plan_monthly", ocrLimit: 50 }); // plan

    const result = await getOcrUsage(mockEnv, "user_paid");

    expect(result).toEqual({ used: 0, remaining: 50, limit: 50 });
  });

  it("combines plan limit with existing OCR scans", async () => {
    const { chain } = setupDb();
    chain.get.mockResolvedValueOnce({ successfulScans: 12 }); // OCR usage → 12 scans
    chain.get.mockResolvedValueOnce({ id: "sub1", planId: "plan_annual", status: "active" }); // subscription
    chain.get.mockResolvedValueOnce({ id: "plan_annual", ocrLimit: 200 }); // plan

    const result = await getOcrUsage(mockEnv, "user_heavy");

    expect(result).toEqual({ used: 12, remaining: 188, limit: 200 });
  });

  it("returns zero remaining when limit is exhausted", async () => {
    const { chain } = setupDb();
    chain.get.mockResolvedValueOnce({ successfulScans: 3 }); // OCR usage → 3 scans (at free limit)
    chain.get.mockResolvedValueOnce(undefined); // subscription → no active sub

    const result = await getOcrUsage(mockEnv, "user_exhausted");

    expect(result).toEqual({ used: 3, remaining: 0, limit: 3 });
  });
});

describe("canUseOcr", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when remaining > 0", async () => {
    const { chain } = setupDb();
    chain.get.mockResolvedValueOnce(undefined); // OCR usage
    chain.get.mockResolvedValueOnce(undefined); // no subscription

    const result = await canUseOcr(mockEnv, "user_free");

    expect(result).toBe(true);
  });

  it("returns false when remaining is 0", async () => {
    const { chain } = setupDb();
    chain.get.mockResolvedValueOnce({ successfulScans: 3 }); // at limit
    chain.get.mockResolvedValueOnce(undefined); // no subscription

    const result = await canUseOcr(mockEnv, "user_exhausted");

    expect(result).toBe(false);
  });
});

describe("feature gates (canImport, canExport, canReceiveAlerts, canAutoMonitor)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const gates = [
    { fn: canImport, field: "importsEnabled" as const },
    { fn: canExport, field: "exportsEnabled" as const },
    { fn: canReceiveAlerts, field: "alertsEnabled" as const },
    { fn: canAutoMonitor, field: "autoMonitoringEnabled" as const },
  ] as const;

  for (const { fn, field } of gates) {
    describe(`${fn.name}`, () => {
      it(`returns true when plan has ${field} enabled`, async () => {
        const { chain } = setupDb();
        chain.get.mockResolvedValueOnce({ id: "sub1", planId: "plan_premium", status: "active" });
        chain.get.mockResolvedValueOnce({ id: "plan_premium", [field]: true });

        const result = await fn(mockEnv, "user_premium");
        expect(result).toBe(true);
      });

      it(`returns false when plan has ${field} disabled`, async () => {
        const { chain } = setupDb();
        chain.get.mockResolvedValueOnce({ id: "sub1", planId: "plan_basic", status: "active" });
        chain.get.mockResolvedValueOnce({ id: "plan_basic", [field]: false });

        const result = await fn(mockEnv, "user_basic");
        expect(result).toBe(false);
      });

      it("returns false when no active subscription", async () => {
        const { chain } = setupDb();
        chain.get.mockResolvedValueOnce(undefined); // no active sub

        const result = await fn(mockEnv, "user_free");
        expect(result).toBe(false);
      });

      it("returns false when no plan found for subscription", async () => {
        const { chain } = setupDb();
        chain.get.mockResolvedValueOnce({ id: "sub1", planId: "plan_unknown", status: "active" });
        chain.get.mockResolvedValueOnce(undefined); // plan not found

        const result = await fn(mockEnv, "user_orphan");
        expect(result).toBe(false);
      });
    });
  }
});
