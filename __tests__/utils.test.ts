import { describe, it, expect } from "vitest";
import { cn, formatDrawDate } from "@/lib/utils";

describe("cn (classname utility)", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves Tailwind conflicts", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});

describe("formatDrawDate", () => {
  it("formats DD-MM-YYYY dash-separated", () => {
    expect(formatDrawDate("15-01-2025")).toBe("Jan 15, 2025");
  });

  it("formats DD/MM/YYYY slash-separated", () => {
    expect(formatDrawDate("15/01/2025")).toBe("Jan 15, 2025");
  });

  it("formats DD.MM.YYYY dot-separated", () => {
    expect(formatDrawDate("15.01.2025")).toBe("Jan 15, 2025");
  });

  it("returns empty string for empty input", () => {
    expect(formatDrawDate("")).toBe("");
  });

  it("returns raw string for non-parseable input", () => {
    expect(formatDrawDate("invalid-date")).toBe("invalid-date");
    expect(formatDrawDate("not-a-date")).toBe("not-a-date");
  });

  it("handles single-digit day and month", () => {
    expect(formatDrawDate("1-1-2025")).toBe("Jan 1, 2025");
  });

  it("handles December date", () => {
    expect(formatDrawDate("25-12-2024")).toBe("Dec 25, 2024");
  });
});
