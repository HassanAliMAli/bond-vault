import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@/lib/server/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logs info as JSON", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test message", { path: "/test" });
    expect(spy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spy.mock.calls[0][0]);
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("test message");
    expect(parsed.path).toBe("/test");
    expect(parsed.timestamp).toBeDefined();
  });

  it("logs warnings as JSON", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("warn message");
    const parsed = JSON.parse(spy.mock.calls[0][0]);
    expect(parsed.level).toBe("warn");
  });

  it("logs errors as JSON", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("error message", { error: "something broke" });
    const parsed = JSON.parse(spy.mock.calls[0][0]);
    expect(parsed.level).toBe("error");
    expect(parsed.error).toBe("something broke");
  });

  it("logs request entries", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.request("GET", "/health", 200, 42, { requestId: "abc123" });
    const parsed = JSON.parse(spy.mock.calls[0][0]);
    expect(parsed.method).toBe("GET");
    expect(parsed.path).toBe("/health");
    expect(parsed.statusCode).toBe(200);
    expect(parsed.durationMs).toBe(42);
    expect(parsed.requestId).toBe("abc123");
  });
});
