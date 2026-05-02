export type PlanLimits = {
  maxTeamMembers: number;
  maxClients: number;
  subdomainRouting: boolean;
};

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  STUDIO: {
    maxTeamMembers: 3,
    maxClients: 5,
    subdomainRouting: false,
  },
  GROWTH: {
    maxTeamMembers: 10,
    maxClients: 25,
    subdomainRouting: true,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.STUDIO;
}

export function checkTeamSeatAvailable(
  plan: string,
  currentMemberCount: number
): { allowed: boolean; reason?: string } {
  const limits = getPlanLimits(plan);
  if (currentMemberCount >= limits.maxTeamMembers) {
    return {
      allowed: false,
      reason: `Your ${plan === "STUDIO" ? "Studio" : "Growth"} plan allows up to ${limits.maxTeamMembers} team members. Upgrade your plan to add more.`,
    };
  }
  return { allowed: true };
}

export function checkClientSeatAvailable(
  plan: string,
  currentClientCount: number
): { allowed: boolean; reason?: string } {
  const limits = getPlanLimits(plan);
  if (currentClientCount >= limits.maxClients) {
    return {
      allowed: false,
      reason: `Your ${plan === "STUDIO" ? "Studio" : "Growth"} plan allows up to ${limits.maxClients} active clients. Upgrade your plan to add more.`,
    };
  }
  return { allowed: true };
}
