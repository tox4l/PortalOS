"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import { createClientSession, clearClientSession } from "@/lib/client-sessions";
import { generateInviteToken, hashToken, inviteExpiresAt } from "@/lib/invite-tokens";
import { sanitizeEmail } from "@/lib/sanitize";
import { getResend, getDefaultFromEmail } from "@/lib/resend";
import { isDevBypass, getDevPortalClient, getDevClientUsers, getDevMagicLinkToken } from "@/lib/dev-bypass";

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

    const client = await prisma.client.findUnique({
      where: { portalSlug: clientSlug },
      select: { id: true, agencyId: true, companyName: true, agency: { select: { name: true, brandColor: true } } },
    });
    if (!client) throw new Error("Client portal not found.");

    const clientUser = await prisma.clientUser.findFirst({
      where: { email, clientId: client.id },
      select: { id: true, name: true },
    });
    if (!clientUser) throw new Error("No account found with that email for this portal.");

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

    const magicLinkUrl = `${process.env.APP_URL ?? "https://portalos.app"}/portal/${clientSlug}/auth?token=${encodeURIComponent(raw)}&email=${encodeURIComponent(email)}`;

    const resend = getResend();
    await resend.emails.send({
      from: getDefaultFromEmail(),
      to: email,
      subject: `Sign in to ${client.companyName} on PortalOS`,
      html: `
        <div style="font-family: Georgia, serif; background: #0A0A0A; color: #FAF8F2; padding: 40px; max-width: 480px; margin: 0 auto;">
          <p style="font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: #8C7340; margin-bottom: 24px;">${client.agency.name}</p>
          <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 16px;">Sign in to your portal</h1>
          <p style="color: #B8B2A0; margin-bottom: 32px;">Click the button below to sign in to ${client.companyName}. This link expires in 7 days.</p>
          <a href="${magicLinkUrl}" style="display: inline-block; background: #8C7340; color: #000; padding: 12px 32px; text-decoration: none; font-size: 14px; letter-spacing: 0.05em;">Sign in</a>
        </div>
      `,
    });

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
    const invitation = await prisma.clientInvitation.findFirst({
      where: {
        token: hashed,
        email,
        clientId: client.id,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        client: { select: { portalSlug: true } },
      },
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

    await prisma.clientInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

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

    const client = await prisma.client.findUniqueOrThrow({
      where: { id: clientId },
      select: { id: true, agencyId: true, companyName: true, portalSlug: true, agency: { select: { name: true } } },
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

    const inviteUrl = `${process.env.APP_URL ?? "https://portalos.app"}/portal/${client.portalSlug ?? "portal"}/auth?token=${encodeURIComponent(raw)}&email=${encodeURIComponent(email)}`;

    const resend = getResend();
    await resend.emails.send({
      from: getDefaultFromEmail(),
      to: email,
      subject: `You've been invited to ${client.companyName} on PortalOS`,
      html: `
        <div style="font-family: Georgia, serif; background: #0A0A0A; color: #FAF8F2; padding: 40px; max-width: 480px; margin: 0 auto;">
          <p style="font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: #8C7340; margin-bottom: 24px;">${client.agency.name}</p>
          <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 16px;">You've been invited</h1>
          <p style="color: #B8B2A0; margin-bottom: 8px;">You've been invited to join <strong>${client.companyName}</strong> as a <strong>${role.toLowerCase().replace(/_/g, " ")}</strong>.</p>
          <p style="color: #B8B2A0; margin-bottom: 32px;">This invitation expires in 7 days.</p>
          <a href="${inviteUrl}" style="display: inline-block; background: #8C7340; color: #000; padding: 12px 32px; text-decoration: none; font-size: 14px; letter-spacing: 0.05em;">Accept Invitation</a>
        </div>
      `,
    });

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
