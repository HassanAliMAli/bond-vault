import { describe, it, expect } from "vitest";

describe("api client", () => {
  it("exports api object with expected domain methods", async () => {
    const { api } = await import("@/lib/api-client");
    const methods = ["bonds", "matches", "draws", "check", "user", "payments", "search", "exports", "notifications", "subscription", "plans", "imports", "ocr"];
    for (const m of methods) {
      expect(api).toHaveProperty(m);
    }
  });

  it("each domain has expected methods", async () => {
    const { api } = await import("@/lib/api-client");
    expect(api.bonds.list).toBeInstanceOf(Function);
    expect(api.bonds.create).toBeInstanceOf(Function);
    expect(api.bonds.get).toBeInstanceOf(Function);
    expect(api.bonds.update).toBeInstanceOf(Function);
    expect(api.bonds.delete).toBeInstanceOf(Function);
    expect(api.bonds.archive).toBeInstanceOf(Function);
    expect(api.bonds.restore).toBeInstanceOf(Function);
    expect(api.matches.list).toBeInstanceOf(Function);
    expect(api.draws.list).toBeInstanceOf(Function);
    expect(api.user.profile).toBeInstanceOf(Function);
    expect(api.payments.create).toBeInstanceOf(Function);
    expect(api.payments.list).toBeInstanceOf(Function);
    expect(api.ocr.usage).toBeInstanceOf(Function);
    expect(api.ocr.record).toBeInstanceOf(Function);
    expect(api.notifications.list).toBeInstanceOf(Function);
    expect(api.notifications.preferences.get).toBeInstanceOf(Function);
    expect(api.notifications.preferences.update).toBeInstanceOf(Function);
    expect(api.subscription.current).toBeInstanceOf(Function);
    expect(api.plans.list).toBeInstanceOf(Function);
  });

  it("exports apiFetchRaw for blob downloads", async () => {
    const { apiFetchRaw } = await import("@/lib/api-client");
    expect(apiFetchRaw).toBeInstanceOf(Function);
  });
});
