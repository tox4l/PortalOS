import { describe, it, expect } from "vitest";
import { sanitizeHtml, sanitizeText, sanitizeEmail, sanitizeSlug, sanitizeInt } from "@/lib/sanitize";

describe("sanitizeHtml", () => {
  it("removes HTML tags", () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).not.toContain("<script>");
  });

  it("encodes special characters", () => {
    const result = sanitizeHtml('<img src=x onerror="alert(1)">');
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
  });

  it("preserves plain text", () => {
    expect(sanitizeHtml("Hello, world!")).toBe("Hello, world!");
  });

  it("handles empty string", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("handles nested tags", () => {
    const result = sanitizeHtml("<div><p>text</p></div>");
    expect(result).not.toContain("<");
  });
});

describe("sanitizeText", () => {
  it("strips control characters", () => {
    expect(sanitizeText("hello\x00world")).toBe("helloworld");
  });

  it("normalizes whitespace", () => {
    expect(sanitizeText("hello   world")).toBe("hello world");
  });

  it("trims whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });

  it("enforces max length", () => {
    expect(sanitizeText("hello world", 5)).toBe("hello");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeText("")).toBe("");
  });
});

describe("sanitizeEmail", () => {
  it("validates a proper email", () => {
    const result = sanitizeEmail("test@example.com");
    expect(result).toBe("test@example.com");
  });

  it("lowercases the email", () => {
    expect(sanitizeEmail("TEST@EXAMPLE.COM")).toBe("test@example.com");
  });

  it("rejects invalid email format", () => {
    expect(sanitizeEmail("not-an-email")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(sanitizeEmail("")).toBeNull();
  });

  it("trims whitespace", () => {
    expect(sanitizeEmail(" test@example.com ")).toBe("test@example.com");
  });
});

describe("sanitizeSlug", () => {
  it("allows valid slugs", () => {
    expect(sanitizeSlug("my-slug_123")).toBe("my-slug_123");
  });

  it("rejects slugs longer than 64 chars", () => {
    expect(sanitizeSlug("a".repeat(65))).toBeNull();
  });

  it("allows dots", () => {
    expect(sanitizeSlug("sub.domain")).toBe("sub.domain");
  });

  it("returns null for empty string", () => {
    expect(sanitizeSlug("")).toBeNull();
  });
});

describe("sanitizeInt", () => {
  it("parses valid integers", () => {
    expect(sanitizeInt("42")).toBe(42);
  });

  it("rejects negative numbers", () => {
    expect(sanitizeInt("-1")).toBeNull();
  });

  it("rejects floats", () => {
    expect(sanitizeInt("3.14")).toBeNull();
  });

  it("rejects non-numeric strings", () => {
    expect(sanitizeInt("abc")).toBeNull();
  });

  it("accepts zero", () => {
    expect(sanitizeInt("0")).toBe(0);
  });
});
