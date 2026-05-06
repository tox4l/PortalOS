import { describe, it, expect } from "vitest";
import { getPlanLimits } from "@/lib/plan-limits";

describe("getPlanLimits", () => {
  it("returns STUDIO plan limits", () => {
    const limits = getPlanLimits("STUDIO");
    expect(limits.maxTeamMembers).toBe(3);
    expect(limits.maxClients).toBe(5);
    expect(limits.subdomainRouting).toBe(false);
  });

  it("returns GROWTH plan limits (unlimited)", () => {
    const limits = getPlanLimits("GROWTH");
    expect(limits.maxTeamMembers).toBe(Infinity);
    expect(limits.maxClients).toBe(Infinity);
    expect(limits.subdomainRouting).toBe(true);
  });

  it("defaults to STUDIO for unknown plans", () => {
    const limits = getPlanLimits("UNKNOWN" as "STUDIO");
    expect(limits.maxTeamMembers).toBe(3);
  });
});
