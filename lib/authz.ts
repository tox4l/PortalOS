import { auth } from "@/lib/auth";
import { getClientSession } from "@/lib/client-sessions";
import { redirect } from "next/navigation";

export type Tier = "AGENCY" | "CLIENT";

export type AuthContext = {
  userId: string;
  tier: Tier;
  agencyId?: string;
  agencyRole?: "OWNER" | "ADMIN" | "MEMBER";
  clientId?: string;
  clientRole?: "CLIENT_LEAD" | "CLIENT_REVIEWER" | "CLIENT_VIEWER";
};

export async function requireSession(): Promise<AuthContext> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = session.user;
  const tier: Tier = user.agencyId ? "AGENCY" : "CLIENT";

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

  if (ctx.tier !== "AGENCY" || !ctx.agencyId) {
    redirect("/login");
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
    redirect(`/portal/${clientSlug}/login`);
  }

  return {
    clientUserId: clientSession.clientUserId,
    clientId: clientSession.clientId,
    agencyId: clientSession.agencyId,
    role: clientSession.role,
  };
}
