/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createNotificationBatch } from "@/lib/server/services/notifications";

vi.mock("@/lib/server/db", () => ({
  getDb: vi.fn(),
}));

vi.mock("@/lib/server/id", () => ({
  generateId: vi.fn(() => "generated-id"),
}));

import { getDb } from "@/lib/server/db";
const mockGetDb = getDb as ReturnType<typeof vi.fn>;

function setupDb(getResult?: unknown) {
  const valuesFn = vi.fn().mockResolvedValue(undefined);
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    get: vi.fn().mockResolvedValue(getResult),
  };

  const mockDb = {
    select: vi.fn().mockReturnValue(chain),
    insert: vi.fn().mockReturnValue({ values: valuesFn }),
  };

  mockGetDb.mockReturnValue(mockDb);
  return { mockDb, chain, valuesFn };
}

const mockEnv = { DB: {}, KV: {}, R2: {}, BETTER_AUTH_SECRET: "test", ENVIRONMENT: "test" } as any;

const baseParams = {
  userId: "user_1",
  matchIds: ["match_1"],
  drawName: "Draw #98",
  totalPrizeValue: 1000000,
  prizeBreakdown: { "1st Prize": 1 },
};

describe("createNotificationBatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults to email channel when no preferences exist", async () => {
    const { valuesFn } = setupDb(undefined); // no prefs found

    await createNotificationBatch(mockEnv, baseParams);

    const channels = valuesFn.mock.calls.map((call: unknown[]) => (call[0] as { channel?: string }).channel);
    const uniqueChannels = [...new Set(channels)];
    expect(uniqueChannels).toEqual(["email"]);
  });

  it("creates notifications for all enabled channels", async () => {
    const { valuesFn } = setupDb({
      emailEnabled: true,
      whatsappEnabled: true,
      smsEnabled: true,
    });

    await createNotificationBatch(mockEnv, baseParams);

    const channels = valuesFn.mock.calls.map((call: unknown[]) => (call[0] as { channel?: string }).channel);
    const uniqueChannels = [...new Set(channels)];
    expect(uniqueChannels).toEqual(["email", "whatsapp", "sms"]);
    expect(valuesFn.mock.calls.length).toBe(6); // 3 channels × 2 inserts (batch + notification)
  });

  it("respects individual channel preferences", async () => {
    const { valuesFn } = setupDb({
      emailEnabled: true,
      whatsappEnabled: false,
      smsEnabled: true,
    });

    await createNotificationBatch(mockEnv, baseParams);

    const channels = valuesFn.mock.calls.map((call: unknown[]) => (call[0] as { channel?: string }).channel);
    const uniqueChannels = [...new Set(channels)];
    expect(uniqueChannels).toEqual(["email", "sms"]);
  });

  it("formats batch record with correct match count", async () => {
    const { valuesFn } = setupDb({ emailEnabled: true });

    await createNotificationBatch(mockEnv, {
      ...baseParams,
      matchIds: ["m1", "m2", "m3"],
    });

    const batchInsert = valuesFn.mock.calls[0][0];
    expect(batchInsert.matchCount).toBe(3);
    expect(batchInsert.status).toBe("pending");
  });

  it("generates singular title for single match", async () => {
    const { valuesFn } = setupDb({ emailEnabled: true });

    await createNotificationBatch(mockEnv, baseParams);

    const notificationInsert = valuesFn.mock.calls[1][0];
    expect(notificationInsert.title).toBe("1 Winning Bond");
  });

  it("generates plural title for multiple matches", async () => {
    const { valuesFn } = setupDb({ emailEnabled: true });

    await createNotificationBatch(mockEnv, {
      ...baseParams,
      matchIds: ["m1", "m2"],
    });

    const notificationInsert = valuesFn.mock.calls[1][0];
    expect(notificationInsert.title).toBe("2 Winning Bonds");
  });

  it("includes prize breakdown in message", async () => {
    const { valuesFn } = setupDb({ emailEnabled: true });

    await createNotificationBatch(mockEnv, {
      ...baseParams,
      prizeBreakdown: { "1st Prize": 1, "2nd Prize": 2 },
    });

    const notificationInsert = valuesFn.mock.calls[1][0];
    expect(notificationInsert.message).toContain("1st Prize: 1");
    expect(notificationInsert.message).toContain("2nd Prize: 2");
    expect(notificationInsert.message).toContain("Total Prize Value: Rs. 1,000,000");
  });

  it("includes match details link in message", async () => {
    const { valuesFn } = setupDb({ emailEnabled: true });

    await createNotificationBatch(mockEnv, baseParams);

    const notificationInsert = valuesFn.mock.calls[1][0];
    expect(notificationInsert.message).toContain("https://bondvault.app/matches");
  });
});
