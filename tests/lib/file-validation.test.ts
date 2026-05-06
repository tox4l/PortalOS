import { describe, it, expect } from "vitest";
import { validateMimeType, validateFileName, validateFileSize, validateFileUpload } from "@/lib/file-validation";

describe("validateMimeType", () => {
  it("accepts PNG", () => {
    expect(validateMimeType("image/png").valid).toBe(true);
  });

  it("accepts JPEG", () => {
    expect(validateMimeType("image/jpeg").valid).toBe(true);
  });

  it("accepts PDF", () => {
    expect(validateMimeType("application/pdf").valid).toBe(true);
  });

  it("rejects executable", () => {
    const result = validateMimeType("application/x-msdownload");
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("rejects empty type", () => {
    expect(validateMimeType("").valid).toBe(false);
  });
});

describe("validateFileName", () => {
  it("accepts normal names", () => {
    const result = validateFileName("report.pdf");
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("report.pdf");
  });

  it("rejects hidden files", () => {
    expect(validateFileName(".env").valid).toBe(false);
  });

  it("sanitizes forbidden characters", () => {
    const result = validateFileName("file<name>.pdf");
    expect(result.valid).toBe(true);
    expect(result.sanitized).not.toContain("<");
  });

  it("rejects empty name", () => {
    expect(validateFileName("").valid).toBe(false);
  });
});

describe("validateFileSize", () => {
  it("accepts files under limit", () => {
    expect(validateFileSize(1024, 52428800).valid).toBe(true);
  });

  it("rejects files over limit", () => {
    expect(validateFileSize(104857601, 104857600).valid).toBe(false);
  });

  it("rejects zero byte files", () => {
    expect(validateFileSize(0, 52428800).valid).toBe(false);
  });
});

describe("validateFileUpload", () => {
  it("accepts valid upload", () => {
    const result = validateFileUpload("report.pdf", "application/pdf", 1024000, 52428800);
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("report.pdf");
  });

  it("rejects invalid type", () => {
    expect(validateFileUpload("malware.exe", "application/x-msdownload", 1024, 52428800).valid).toBe(false);
  });

  it("rejects oversized file", () => {
    expect(validateFileUpload("big.zip", "application/zip", 999999999, 52428800).valid).toBe(false);
  });
});
