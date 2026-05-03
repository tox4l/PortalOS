"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import { createClientSession, clearClientSession } from "@/lib/client-sessions";
import { generateInviteToken, hashToken, inviteExpiresAt } from "@/lib/invite-tokens";
import { sanitizeEmail } from "@/lib/sanitize";
import { isDevBypass, getDevPortalClient, getDevClientUsers, getDevMagicLinkToken } from "@/lib/dev-bypass";
import {
  buildClientAuthUrl,
  renderMagicLinkEmail,
  renderClientTeammateInviteEmail,
  sendEmail,
} from "@/lib/email";
import { checkRateLimit } from "@/lib/action-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";

// ─── Request Magic Link ───

const magicLinkSchema = z.object({
  email: z.string().email(),
  clientSlug: z.string().min(1),
});

export async function requestMagicLinkAction(
  clientSlug: string,
  _prevState: ActionResult<{ sent: boolean }>,
  formData: FormData
): Promise<ActionResult<{ sent: boolean }>> {
  return createSafeAction(async () => {
    const email = sanitizeEmail(formData.get("email") as string);
    if (!email) throw new Error("Valid email is required.");

    if (isDevBypass()) {
      return { sent: true };
    }

    await checkRateLimit("auth/magic-link", RATE_LIMITS.MAGIC_LINK);

    const client = await prisma.client.findUnique({
      where: { portalSlug: clientSlug },
      select: { id: true, agencyId: true, companyName: true, agency: { select: { name: true, brandColor: true, slug: true, plan: true } } },
    });
    if (!client) throw new Error("Client portal not found.");

    const clientUser = await prisma.clientUser.findFirst({
      where: { email, clientId: client.id },
      select: { id: true, name: true },
    });
    if (!clientUser) {
      // Do not reveal whether the email exists — return success either way
      return { sent: true };
    }

    const { raw, hashed } = await generateInviteToken();
    const expiresAt = inviteExpiresAt();

    await prisma.clientInvitation.upsert({
      where: { clientId_email: { clientId: client.id, email } },
      create: {
        clientId: client.id,
        agencyId: client.agencyId,
        email,
        role: "CLIENT_LEAD",
        token: hashed,
        expiresAt,
        invitedById: clientUser.id,
      },
      update: {
        token: hashed,
        expiresAt,
        acceptedAt: null,
      },
    });

    const magicLinkUrl = buildClientAuthUrl(clientSlug, raw, email, {
      plan: client.agency.plan,
      agencySlug: client.agency.slug,
    });

    await sendEmail(
      email,
      `Sign in to ${client.companyName} on PortalOS`,
      renderMagicLinkEmail({
        agency: {
          name: client.agency.name,
          brandColor: client.agency.brandColor,
        },
        companyName: client.companyName,
        magicLinkUrl,
      })
    );

    return { sent: true };
  });
}

// ─── Consume Magic Link ───

export async function consumeMagicLinkAction(
  token: string,
  email: string,
  clientSlug: string
): Promise<ActionResult<{ redirectTo: string }>> {
  return createSafeAction(async () => {
    if (isDevBypass()) {
      const client = getDevPortalClient(clientSlug);
      if (!client) throw new Error("Client not found.");

      await createClientSession({
        clientUserId: "dev-client-user-001",
        clientId: client.id,
        agencyId: "dev-agency-001",
        clientSlug,
        role: "CLIENT_LEAD",
      });

      return { redirectTo: `/portal/${clientSlug}` };
    }

    const client = await prisma.client.findUnique({
      where: { portalSlug: clientSlug },
      select: { id: true },
    });
    if (!client) throw new Error("Client portal not found.");

    const hashed = await hashToken(token);

    // Atomically claim the invitation to prevent TOCTOU race
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

    if (claim.count === 0) throw new Error("Invalid or expired magic link.");

    // Now safely read the claimed invitation
    const invitation = await prisma.clientInvitation.findFirst({
      where: {
        token: hashed,
        email,
        clientId: client.id,
      },
      select: { agencyId: true, role: true },
    });
    if (!invitation) throw new Error("Invalid or expired magic link.");

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
          agencyId: invitation.agencyId,
          role: invitation.role,
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
      agencyId: invitation.agencyId,
      clientSlug,
      role: clientUser.role,
    });

    return { redirectTo: `/portal/${clientSlug}` };
  });
}

// ─── Invite Client Teammate ───

const inviteClientTeammateSchema = z.object({
  email: z.string().email(),
  role: z.enum(["CLIENT_LEAD", "CLIENT_REVIEWER", "CLIENT_VIEWER"]),
});

export async function inviteClientTeammateAction(
  clientId: string,
  _prevState: ActionResult<{ invitationId: string }>,
  formData: FormData
): Promise<ActionResult<{ invitationId: string }>> {
  return createSafeAction(async () => {
    const email = sanitizeEmail(formData.get("email") as string);
    if (!email) throw new Error("Valid email is required.");

    const parsed = inviteClientTeammateSchema.safeParse({
      email,
      role: formData.get("role"),
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0].message);

    const { role } = parsed.data;

    if (isDevBypass()) {
      return { invitationId: `dev-client-invite-${Date.now()}` };
    }

    await checkRateLimit("auth/client-invite", RATE_LIMITS.CLIENT_INVITE);

    const client = await prisma.client.findUniqueOrThrow({
      where: { id: clientId },
      select: { id: true, agencyId: true, companyName: true, portalSlug: true, agency: { select: { name: true, brandColor: true, slug: true, plan: true } } },
    });

    const existingUser = await prisma.clientUser.findFirst({
      where: { email, clientId },
    });
    if (existingUser) throw new Error("A team member with this email already exists in this portal.");

    const existingInvite = await prisma.clientInvitation.findUnique({
      where: { clientId_email: { clientId, email } },
    });
    if (existingInvite && existingInvite.expiresAt > new Date() && !existingInvite.acceptedAt) {
      throw new Error("An invitation has already been sent to this email.");
    }

    const { raw, hashed } = await generateInviteToken();
    const expiresAt = inviteExpiresAt();

    await prisma.clientInvitation.upsert({
      where: { clientId_email: { clientId, email } },
      create: {
        clientId,
        agencyId: client.agencyId,
        email,
        role,
        token: hashed,
        expiresAt,
        invitedById: "system",
      },
      update: {
        role,
        token: hashed,
        expiresAt,
        acceptedAt: null,
      },
    });

    const inviteUrl = buildClientAuthUrl(client.portalSlug ?? "portal", raw, email, {
      plan: client.agency.plan,
      agencySlug: client.agency.slug,
    });

    await sendEmail(
      email,
      `You've been invited to ${client.companyName} on PortalOS`,
      renderClientTeammateInviteEmail({
        agency: {
          name: client.agency.name,
          brandColor: client.agency.brandColor,
        },
        companyName: client.companyName,
        role,
        inviteUrl,
      })
    );

    revalidatePath(`/portal/${client.portalSlug ?? "portal"}`);
    return { invitationId: "invite-sent" };
  });
}

// ─── Sign Out Client ───

export async function signOutClientAction(): Promise<ActionResult<void>> {
  return createSafeAction(async () => {
    await clearClientSession();
  });
}
