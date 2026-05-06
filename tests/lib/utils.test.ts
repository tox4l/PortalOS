import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatRelativeDate } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats USD", () => {
    expect(formatCurrency(99)).toContain("99");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });
});

describe("formatRelativeDate", () => {
  it('returns "Just now" for recent dates', () => {
    expect(formatRelativeDate(new Date())).toBe("Just now");
  });

  it("returns a relative string for past dates", () => {
    const past = new Date(Date.now() - 3600000);
    expect(formatRelativeDate(past)).toContain("ago");
  });
});
