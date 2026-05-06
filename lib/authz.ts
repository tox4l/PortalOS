import { auth } from "@/lib/auth";
import { getClientSession } from "@/lib/client-sessions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Returns true when the user has an active session but has not yet created
 * or been assigned to an agency. Callers should redirect to `/onboarding`
 * rather than `/login` in this case to avoid infinite redirect loops.
 */
export async function needsOnboarding(): Promise<boolean> {
  const session = await auth();
  return !!session?.user?.id && !session?.user?.agencyId;
}

/**
 * Detect whether the current request is inside a /portal/* path.
 * Uses multiple header sources for cross-environment compatibility.
 */
async function isPortalPath(): Promise<boolean> {
  try {
    const h = await headers();
    const xUrl = h.get("x-url") ?? "";
    const referer = h.get("referer") ?? "";
    const nextUrl = h.get("next-url") ?? "";
    return xUrl.includes("/portal/") || referer.includes("/portal/") || nextUrl.includes("/portal/");
  } catch {
    return false;
  }
}

export type Tier = "AGENCY" | "CLIENT";

export type AuthContext = {
  userId: string;
  tier: Tier;
  agencyId?: string;
  agencyRole?: "OWNER" | "ADMIN" | "MEMBER";
  clientId?: string;
  clientRole?: "CLIENT_LEAD" | "CLIENT_REVIEWER" | "CLIENT_VIEWER";
};

export async function requireSession(): Promise<AuthContext | null> {
  const session = await auth();

  if (!session?.user?.id) {
    // If we are on a /portal path, do NOT redirect to agency /login.
    // Let client session handling take over instead.
    if (await isPortalPath()) {
      return null;
    }
    redirect("/login");
  }

  const user = session.user;
  const tier: Tier = user.agencyId ? "AGENCY" : "CLIENT";

  // CLIENT tier (session exists but no agency) is allowed through.
  // The caller decides how to handle it (redirect to onboarding, or proceed).
  // Only redirect if there is no session at all (handled above).

  return {
    userId: user.id,
    tier,
    agencyId: user.agencyId ?? undefined,
    agencyRole: (user.role as AuthContext["agencyRole"]) ?? undefined,
    clientId: undefined,
    clientRole: undefined,
  };
}

export async function requireAgencyMember(): Promise<AuthContext> {
  const ctx = await requireSession();

  if (!ctx) {
    redirect("/onboarding");
  }

  if (ctx.tier !== "AGENCY" || !ctx.agencyId) {
    redirect("/onboarding");
  }

  return ctx;
}

export async function requireAgencyAdmin(agencyId: string): Promise<AuthContext> {
  const ctx = await requireAgencyMember();

  if (ctx.agencyId !== agencyId) {
    redirect("/login");
  }

  if (ctx.agencyRole !== "OWNER" && ctx.agencyRole !== "ADMIN") {
    redirect("/app/dashboard");
  }

  return ctx;
}

export async function getViewScope(): Promise<
  | { tier: "AGENCY"; agencyId: string }
  | { tier: "CLIENT"; clientId: string }
  | null
> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    if (session.user.agencyId) {
      return { tier: "AGENCY", agencyId: session.user.agencyId };
    }

    return null;
  } catch {
    return null;
  }
}

export async function requireClientSession(clientSlug: string): Promise<{
  clientUserId: string;
  clientId: string;
  agencyId: string;
  role: string;
}> {
  const clientSession = await getClientSession();

  if (!clientSession || clientSession.clientSlug !== clientSlug) {
    // Prevent redirect loop: if already on the login page, throw instead
    const h = await headers();
    const requestUrl = h.get("x-url") ?? h.get("referer") ?? "";
    if (requestUrl.includes(`/portal/${clientSlug}/login`)) {
      // Already on the login page -- do not redirect again
      throw new Error("No client session available");
    }
    redirect(`/portal/${clientSlug}/login`);
  }

  return {
    clientUserId: clientSession.clientUserId,
    clientId: clientSession.clientId,
    agencyId: clientSession.agencyId,
    role: clientSession.role,
  };
}
