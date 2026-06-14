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
    expect(mod.useUpdateUser).toBeInstanceOf(Function);
    expect(mod.useUploadDrawPdf).toBeInstanceOf(Function);
    expect(mod.useAddWinners).toBeInstanceOf(Function);
  });
});
