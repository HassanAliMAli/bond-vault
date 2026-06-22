/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/server/services/matches", () => ({
  generateMatchesForDraw: vi.fn(),
}));

vi.mock("@/lib/server/services/notifications", () => ({
  sendPendingNotifications: vi.fn(),
}));

vi.mock("@/lib/server/services/cron", () => ({
  handleSubscriptionExpiration: vi.fn(),
}));

vi.mock("@/lib/server/services/retention", () => ({
  handleRetentionCleanup: vi.fn(),
  handleImportCleanup: vi.fn(),
}));

vi.mock("@/lib/server/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { handleQueueMessage } from "@/lib/server/queue";
import { generateMatchesForDraw } from "@/lib/server/services/matches";
import { sendPendingNotifications } from "@/lib/server/services/notifications";
import { handleSubscriptionExpiration } from "@/lib/server/services/cron";
import { handleRetentionCleanup, handleImportCleanup } from "@/lib/server/services/retention";
import { logger } from "@/lib/server/logger";

const mockGenerateMatchesForDraw = generateMatchesForDraw as ReturnType<typeof vi.fn>;
const mockSendPendingNotifications = sendPendingNotifications as ReturnType<typeof vi.fn>;
const mockHandleSubscriptionExpiration = handleSubscriptionExpiration as ReturnType<typeof vi.fn>;
const mockHandleRetentionCleanup = handleRetentionCleanup as ReturnType<typeof vi.fn>;
const mockHandleImportCleanup = handleImportCleanup as ReturnType<typeof vi.fn>;
function makeEnv(queueSend?: ReturnType<typeof vi.fn>): any {
  return {
    DB: {},
    KV: {},
    R2: {},
    BETTER_AUTH_SECRET: "test",
    ENVIRONMENT: "test",
    NotificationDeliveryQueue: { send: queueSend ?? vi.fn() },
  };
}

describe("handleQueueMessage", () => {
  it("routes match-generation to handler and pushes notification queue when matches found", async () => {
    mockGenerateMatchesForDraw.mockResolvedValueOnce(5);
    const queueSend = vi.fn().mockResolvedValue(undefined);
    const env = makeEnv(queueSend);

    await handleQueueMessage(env, { queue: "match-generation", body: { drawId: "draw_1" } });

    expect(mockGenerateMatchesForDraw).toHaveBeenCalledWith(env, "draw_1");
    expect(queueSend).toHaveBeenCalledWith({ type: "send-pending" });
  });

  it("does not push to notification queue when no matches found", async () => {
    mockGenerateMatchesForDraw.mockResolvedValueOnce(0);
    const queueSend = vi.fn();
    const env = makeEnv(queueSend);

    await handleQueueMessage(env, { queue: "match-generation", body: { drawId: "draw_1" } });

    expect(queueSend).not.toHaveBeenCalled();
  });

  it("routes notification-delivery to sendPendingNotifications", async () => {
    mockSendPendingNotifications.mockResolvedValueOnce(3);
    const env = makeEnv();

    await handleQueueMessage(env, { queue: "notification-delivery", body: { type: "send-pending" } });

    expect(mockSendPendingNotifications).toHaveBeenCalledWith(env);
  });

  it("routes cleanup-jobs to all retention handlers", async () => {
    mockHandleSubscriptionExpiration.mockResolvedValueOnce(2);
    mockHandleRetentionCleanup.mockResolvedValueOnce({ deletedUsers: 1, cleanedImports: 5, cleanedAuditLogs: 10 });
    mockHandleImportCleanup.mockResolvedValueOnce(3);
    const env = makeEnv();

    await handleQueueMessage(env, { queue: "cleanup-jobs", body: { type: "maintenance" } });

    expect(mockHandleSubscriptionExpiration).toHaveBeenCalledWith(env);
    expect(mockHandleRetentionCleanup).toHaveBeenCalledWith(env);
    expect(mockHandleImportCleanup).toHaveBeenCalledWith(env);
  });

  it("routes draw-processing to stub handler", async () => {
    const env = makeEnv();

    await handleQueueMessage(env, { queue: "draw-processing", body: { drawId: "draw_1", action: "import" } });

    expect(logger.info).toHaveBeenCalledWith("Queue: draw-processing stub — not yet implemented");
  });

  it("does nothing for unknown queue", async () => {
    const env = makeEnv();

    await expect(
      handleQueueMessage(env, { queue: "unknown-queue", body: {} })
    ).resolves.toBeUndefined();
  });
});
