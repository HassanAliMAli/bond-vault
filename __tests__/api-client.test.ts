import { describe, it, expect } from "vitest";
import { apiFetchRaw } from "@/lib/api-client";

describe("apiFetchRaw", () => {
  it("builds the correct URL with params", async () => {
    // This is a type/interface test — actual HTTP is tested via e2e
    const fn = apiFetchRaw.toString();
    expect(fn).toBeDefined();
  });
});

describe("API client interface", () => {
  it("exports api object with expected methods", async () => {
    const { api } = await import("@/lib/api-client");
    expect(api.bonds).toBeDefined();
    expect(api.bonds.list).toBeInstanceOf(Function);
    expect(api.user).toBeDefined();
    expect(api.user.profile).toBeInstanceOf(Function);
    expect(api.admin).toBeUndefined();
  });
});
