import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

describe("useOcr", () => {
  it("exports useOcr hook (runtime)", async () => {
    const mod: Record<string, unknown> = await import("@/hooks/use-ocr");
    expect(mod.useOcr).toBeInstanceOf(Function);
  });

  it("returns expected initial state", async () => {
    const { useOcr } = await import("@/hooks/use-ocr");
    const { result } = renderHook(() => useOcr());

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.results).toEqual([]);
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.recordingError).toBeNull();
    expect(result.current.bondValidation).toBeNull();
    expect(result.current.scan).toBeInstanceOf(Function);
    expect(result.current.updateBond).toBeInstanceOf(Function);
    expect(result.current.removeBond).toBeInstanceOf(Function);
    expect(result.current.saveBonds).toBeInstanceOf(Function);
    expect(result.current.retry).toBeInstanceOf(Function);
    expect(result.current.reset).toBeInstanceOf(Function);
  });
});
