/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { logAudit, getClientIp } from "@/lib/server/services/audit";

vi.mock("@/lib/server/db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "@/lib/server/db";
const mockGetDb = getDb as ReturnType<typeof vi.fn>;

function setupDb() {
  const valuesFn = vi.fn().mockResolvedValue(undefined);
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn().mockReturnValue({ values: valuesFn }),
    update: vi.fn(),
  };

  mockGetDb.mockReturnValue(mockDb);
  return { mockDb, valuesFn };
}

vi.mock("@/lib/server/id", () => ({
  generateId: vi.fn(() => "generated-id-123"),
}));

const mockEnv = { DB: {}, KV: {}, R2: {}, BETTER_AUTH_SECRET: "test", ENVIRONMENT: "test" } as any;

describe("logAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts an audit log with all fields", async () => {
    const { valuesFn } = setupDb();

    await logAudit(mockEnv, {
      userId: "user_1",
      action: "test.action",
      entityType: "payment",
      entityId: "pay_123",
      ipAddress: "192.168.1.1",
    });

    expect(valuesFn).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "generated-id-123",
        userId: "user_1",
        action: "test.action",
        entityType: "payment",
        entityId: "pay_123",
        ipAddress: "192.168.1.1",
      }),
    );
  });

  it("stores metadata as JSON string when provided", async () => {
    const { valuesFn } = setupDb();

    await logAudit(mockEnv, {
      userId: "user_1",
      action: "admin.settings.update",
      entityType: "system_settings",
      metadata: { key: "max_ocr", oldValue: "10", newValue: "50" },
    });

    const callArg = valuesFn.mock.calls[0][0];
    expect(callArg.metadataJson).toBe(
      JSON.stringify({ key: "max_ocr", oldValue: "10", newValue: "50" }),
    );
  });

  it("sets null for optional fields when not provided", async () => {
    const { valuesFn } = setupDb();

    await logAudit(mockEnv, {
      action: "system.health",
    });

    const callArg = valuesFn.mock.calls[0][0];
    expect(callArg.userId).toBeNull();
    expect(callArg.entityType).toBeNull();
    expect(callArg.entityId).toBeNull();
    expect(callArg.ipAddress).toBeNull();
    expect(callArg.metadataJson).toBeNull();
  });

  it("includes a createdAt timestamp", async () => {
    const { valuesFn } = setupDb();

    await logAudit(mockEnv, { action: "test.action" });

    const callArg = valuesFn.mock.calls[0][0];
    expect(callArg.createdAt).toBeDefined();
    expect(typeof callArg.createdAt).toBe("string");
    expect(new Date(callArg.createdAt).toISOString()).toBe(callArg.createdAt);
  });
});

describe("getClientIp", () => {
  it("returns cf.requestIp when available", () => {
    const c = {
      req: {
        raw: { cf: { requestIp: "203.0.113.1" } },
        header: vi.fn(() => undefined),
      },
    } as any;

    expect(getClientIp(c)).toBe("203.0.113.1");
  });

  it("falls back to x-forwarded-for when cf ip is missing", () => {
    const c = {
      req: {
        raw: {},
        header: vi.fn((name: string) => {
          if (name === "x-forwarded-for") return "10.0.0.1, 10.0.0.2";
          return undefined;
        }),
      },
    } as any;

    expect(getClientIp(c)).toBe("10.0.0.1");
  });

  it("falls back to x-real-ip when other headers are missing", () => {
    const c = {
      req: {
        raw: {},
        header: vi.fn((name: string) => {
          if (name === "x-real-ip") return "172.16.0.1";
          return undefined;
        }),
      },
    } as any;

    expect(getClientIp(c)).toBe("172.16.0.1");
  });

  it("returns 'unknown' when no IP source is available", () => {
    const c = {
      req: {
        raw: {},
        header: vi.fn(() => undefined),
      },
    } as any;

    expect(getClientIp(c)).toBe("unknown");
  });
});
