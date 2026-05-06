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
    maxTeamMembers: Infinity,
    maxClients: Infinity,
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
  if (!Number.isFinite(limits.maxTeamMembers)) {
    return { allowed: true };
  }
  if (currentMemberCount >= limits.maxTeamMembers) {
    return {
      allowed: false,
      reason: `Your ${plan === "STUDIO" ? "Studio" : "Growth"} plan allows up to ${limits.maxTeamMembers} team members. Upgrade your plan to add more.`,
    };
  }
  return { allowed: true };
}

export function buildPortalUrl(
  agencySlug: string | null,
  clientSlug: string,
  plan: string,
  path?: string
): string {
  const appUrl = process.env.APP_URL ?? "https://portalos.tech";
  const base = appUrl.replace(/\/$/, "");

  if (plan === "GROWTH" && agencySlug) {
    // Growth: {agency}.portalos.tech/portal/{client}
    try {
      const url = new URL(base);
      return `${url.protocol}//${agencySlug}.${url.host}/portal/${clientSlug}${path ?? ""}`;
    } catch {
      return `${base}/portal/${clientSlug}${path ?? ""}`;
    }
  }

  // Studio: portalos.tech/portal/{client}
  return `${base}/portal/${clientSlug}${path ?? ""}`;
}

export function checkClientSeatAvailable(
  plan: string,
  currentClientCount: number
): { allowed: boolean; reason?: string } {
  const limits = getPlanLimits(plan);
  if (!Number.isFinite(limits.maxClients)) {
    return { allowed: true };
  }
  if (currentClientCount >= limits.maxClients) {
    return {
      allowed: false,
      reason: `Your ${plan === "STUDIO" ? "Studio" : "Growth"} plan allows up to ${limits.maxClients} active clients. Upgrade your plan to add more.`,
    };
  }
  return { allowed: true };
}
