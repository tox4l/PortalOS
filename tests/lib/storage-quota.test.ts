import { describe, it, expect } from "vitest";
import { formatBytes } from "@/lib/storage-quota";

describe("formatBytes", () => {
  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(2048)).toBe("2 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(10485760)).toBe("10 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(5368709120)).toBe("5 GB");
  });

  it("handles zero", () => {
    expect(formatBytes(0)).toBe("0 B");
  });
});
