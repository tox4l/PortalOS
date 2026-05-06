import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/invite-tokens";
import { createClientSession } from "@/lib/client-sessions";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { isDevBypass, getDevPortalClient } from "@/lib/dev-bypass";

function getIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return "127.0.0.1";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientSlug: string }> }
) {
  const { clientSlug } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(
      new URL(`/portal/${clientSlug}/login?error=invalid-link`, request.url)
    );
  }

  const ip = getIp(request);
  const rl = await rateLimit(ip, `magic-link:${clientSlug}`, RATE_LIMITS.MAGIC_LINK);
  if (!rl.allowed) {
    return NextResponse.redirect(
      new URL(`/portal/${clientSlug}/login?error=too-many-requests`, request.url)
    );
  }

  if (isDevBypass()) {
    const client = getDevPortalClient(clientSlug);
    if (!client) {
      return NextResponse.redirect(
        new URL(`/portal/${clientSlug}/login?error=portal-not-found`, request.url)
      );
    }

    await createClientSession({
      clientUserId: "dev-client-user-001",
      clientId: client.id,
      agencyId: "dev-agency-001",
      clientSlug,
      role: "CLIENT_LEAD",
    });

    return NextResponse.redirect(new URL(`/portal/${clientSlug}`, request.url));
  }

  const client = await prisma.client.findUnique({
    where: { portalSlug: clientSlug },
    select: { id: true, agencyId: true },
  });

  if (!client) {
    return NextResponse.redirect(
      new URL(`/portal/${clientSlug}/login?error=portal-not-found`, request.url)
    );
  }

  const hashed = await hashToken(token);

  const claim = await prisma.clientInvitation.updateMany({
    where: {
      token: hashed,
      email,
      clientId: client.id,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { acceptedAt: new Date() },
  });

  if (claim.count === 0) {
    return NextResponse.redirect(
      new URL(`/portal/${clientSlug}/login?error=expired`, request.url)
    );
  }

  const invitation = await prisma.clientInvitation.findFirst({
    where: { token: hashed, email, clientId: client.id },
    select: { role: true },
  });

  let clientUser = await prisma.clientUser.findFirst({
    where: { email, clientId: client.id },
    select: { id: true, role: true },
  });

  if (!clientUser) {
    clientUser = await prisma.clientUser.create({
      data: {
        email,
        name: email.split("@")[0],
        clientId: client.id,
        agencyId: client.agencyId,
        role: invitation?.role ?? "CLIENT_LEAD",
      },
      select: { id: true, role: true },
    });
  }

  await prisma.clientUser.update({
    where: { id: clientUser.id },
    data: { lastLoginAt: new Date() },
  });

  await createClientSession({
    clientUserId: clientUser.id,
    clientId: client.id,
    agencyId: client.agencyId,
    clientSlug,
    role: clientUser.role,
  });

  return NextResponse.redirect(new URL(`/portal/${clientSlug}`, request.url));
}
