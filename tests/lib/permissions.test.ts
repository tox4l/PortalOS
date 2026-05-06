import { describe, it, expect } from "vitest";
import { checkPermission } from "@/lib/permissions";

describe("checkPermission", () => {
  it("grants OWNER all permissions", async () => {
    expect(await checkPermission("OWNER" as never, "client:create")).toBe(true);
    expect(await checkPermission("OWNER" as never, "team:manage")).toBe(true);
    expect(await checkPermission("OWNER" as never, "plan:view")).toBe(true);
  });

  it("grants ADMIN most permissions", async () => {
    expect(await checkPermission("ADMIN" as never, "client:create")).toBe(true);
    expect(await checkPermission("ADMIN" as never, "team:manage")).toBe(true);
  });

  it("denies ADMIN plan:view and team:change-role", async () => {
    expect(await checkPermission("ADMIN" as never, "plan:view")).toBe(false);
    expect(await checkPermission("ADMIN" as never, "team:change-role")).toBe(false);
  });

  it("grants MEMBER only project:write", async () => {
    expect(await checkPermission("MEMBER" as never, "project:write")).toBe(true);
    expect(await checkPermission("MEMBER" as never, "client:create")).toBe(false);
    expect(await checkPermission("MEMBER" as never, "team:manage")).toBe(false);
  });

  it("returns false for unknown permissions", async () => {
    expect(await checkPermission("OWNER" as never, "unknown:action" as never)).toBe(false);
  });
});
