import { describe, it, expect } from "vitest";

describe("admin hooks", () => {
  it("exports expected hooks (runtime)", async () => {
    const mod: Record<string, unknown> = await import("@/hooks/use-admin");
    expect(mod.useAdminDashboard).toBeInstanceOf(Function);
    expect(mod.useAdminUsers).toBeInstanceOf(Function);
    expect(mod.useAdminPayments).toBeInstanceOf(Function);
    expect(mod.useAdminDraws).toBeInstanceOf(Function);
    expect(mod.useAdminSettings).toBeInstanceOf(Function);
    expect(mod.useAuditLogs).toBeInstanceOf(Function);
    expect(mod.useCreateDraw).toBeInstanceOf(Function);
    expect(mod.useGenerateMatches).toBeInstanceOf(Function);
    expect(mod.useUpdateSetting).toBeInstanceOf(Function);
    expect(mod.useSuspendUser).toBeInstanceOf(Function);
    expect(mod.useRestoreUser).toBeInstanceOf(Function);
    expect(mod.useApprovePayment).toBeInstanceOf(Function);
    expect(mod.useRejectPayment).toBeInstanceOf(Function);
    expect(mod.useUploadDrawPdf).toBeInstanceOf(Function);
    expect(mod.useAddWinners).toBeInstanceOf(Function);
  });
});

describe("subscription hooks", () => {
  it("exports expected hooks (runtime)", async () => {
    const mod: Record<string, unknown> = await import("@/hooks/use-subscription");
    expect(mod.usePlans).toBeInstanceOf(Function);
    expect(mod.useCurrentSubscription).toBeInstanceOf(Function);
    expect(mod.useCreatePayment).toBeInstanceOf(Function);
    expect(mod.useUploadReceipt).toBeInstanceOf(Function);
    expect(mod.usePayments).toBeInstanceOf(Function);
    expect(mod.useOcrUsage).toBeInstanceOf(Function);
  });
});

describe("notification hooks", () => {
  it("exports expected hooks (runtime)", async () => {
    const mod: Record<string, unknown> = await import("@/hooks/use-notifications");
    expect(mod.useNotifications).toBeInstanceOf(Function);
    expect(mod.useNotificationPreferences).toBeInstanceOf(Function);
    expect(mod.useUpdateNotificationPreferences).toBeInstanceOf(Function);
  });
});

describe("import hooks", () => {
  it("exports expected hooks (runtime)", async () => {
    const mod: Record<string, unknown> = await import("@/hooks/use-imports");
    expect(mod.useImportUpload).toBeInstanceOf(Function);
    expect(mod.useImportConfirm).toBeInstanceOf(Function);
    expect(mod.useImportHistory).toBeInstanceOf(Function);
    expect(mod.useExportCsv).toBeInstanceOf(Function);
    expect(mod.useExportXlsx).toBeInstanceOf(Function);
  });
});
