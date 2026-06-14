import { describe, it, expect } from "vitest";

describe("api client", () => {
  it("exports api object with expected domain methods", async () => {
    const { api } = await import("@/lib/api-client");
    const methods = ["bonds", "matches", "draws", "check", "user", "payments", "search", "exports"];
    for (const m of methods) {
      expect(api).toHaveProperty(m);
    }
  });

  it("each domain has a list function", async () => {
    const { api } = await import("@/lib/api-client");
    expect(api.bonds.list).toBeInstanceOf(Function);
    expect(api.matches.list).toBeInstanceOf(Function);
    expect(api.draws.list).toBeInstanceOf(Function);
    expect(api.user.profile).toBeInstanceOf(Function);
  });
});
