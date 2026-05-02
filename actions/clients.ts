"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { checkClientSeatAvailable } from "@/lib/plan-limits";
import { generateInviteToken, inviteExpiresAt } from "@/lib/invite-tokens";
import { sanitizeEmail } from "@/lib/sanitize";
import { getResend, getDefaultFromEmail } from "@/lib/resend";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import { isDevBypass } from "@/lib/dev-bypass";

const createClientSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required."),
  contactName: z.string().trim().min(2, "Contact name is required."),
  contactEmail: z.string().trim().email("Enter a valid contact email."),
  portalSlug: z
    .string()
    .trim()
    .min(2, "Portal slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  welcomeMessage: z.string().trim().min(10, "Welcome message should be at least 10 characters."),
});

export type CreateClientState = ActionResult<{
  clientId: string;
  portalSlug: string;
}>;

export async function createClientAction(
  _previousState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in to create a client.");
    }

    const allowed = await checkPermission(session.user.id, "client:create");

    if (!allowed) {
      throw new Error("You do not have permission to create clients.");
    }

    const input = createClientSchema.parse({
      companyName: formData.get("companyName"),
      contactName: formData.get("contactName"),
      contactEmail: formData.get("contactEmail"),
      portalSlug: formData.get("portalSlug"),
      welcomeMessage: formData.get("welcomeMessage")
    });

    if (isDevBypass()) {
      revalidatePath("/app/clients");
      return {
        clientId: "dev-client-new",
        portalSlug: input.portalSlug
      };
    }

    const agency = await prisma.agency.findUniqueOrThrow({
      where: { id: session.user.agencyId },
      include: { _count: { select: { clients: { where: { status: "ACTIVE" } } } } },
    });

    const seatCheck = checkClientSeatAvailable(agency.plan, agency._count.clients);
    if (!seatCheck.allowed) throw new Error(seatCheck.reason);

    const existing = await prisma.client.findUnique({
      where: { portalSlug: input.portalSlug },
      select: { id: true },
    });
    if (existing) throw new Error("A client with that portal URL already exists. Choose a different slug.");

    const client = await prisma.client.create({
      data: {
        companyName: input.companyName,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        portalSlug: input.portalSlug,
        welcomeMessage: input.welcomeMessage,
        status: "ACTIVE",
        agencyId: session.user.agencyId,
        clientUsers: {
          create: {
            email: input.contactEmail,
            name: input.contactName,
            agencyId: session.user.agencyId
          }
        }
      },
      select: {
        id: true,
        portalSlug: true
      }
    });

    // Generate magic link token for the new client user
    const { raw, hashed } = await generateInviteToken();
    const expiresAt = inviteExpiresAt();

    const clientUser = await prisma.clientUser.findFirst({
      where: { email: input.contactEmail, clientId: client.id },
      select: { id: true },
    });

    if (clientUser) {
      await prisma.clientInvitation.create({
        data: {
          clientId: client.id,
          agencyId: session.user.agencyId,
          email: input.contactEmail,
          role: "CLIENT_LEAD",
          token: hashed,
          expiresAt,
          invitedById: clientUser.id,
        },
      });

      const magicLinkUrl = `${process.env.APP_URL ?? "https://portalos.app"}/portal/${client.portalSlug}/auth?token=${encodeURIComponent(raw)}&email=${encodeURIComponent(input.contactEmail)}`;

      const resend = getResend();
      await resend.emails.send({
        from: getDefaultFromEmail(),
        to: input.contactEmail,
        subject: `Welcome to your portal — ${input.companyName}`,
        html: `
          <div style="font-family: Georgia, serif; background: #0A0A0A; color: #FAF8F2; padding: 40px; max-width: 480px; margin: 0 auto;">
            <p style="font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: #8C7340; margin-bottom: 24px;">${session.user.agencyName ?? "Your Agency"}</p>
            <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 16px;">Your portal is ready</h1>
            <p style="color: #B8B2A0; margin-bottom: 8px;">Hi ${input.contactName}, your dedicated project portal for <strong>${input.companyName}</strong> has been set up.</p>
            <p style="color: #B8B2A0; margin-bottom: 32px;">Sign in below to track progress, review deliverables, and stay aligned with the team.</p>
            <a href="${magicLinkUrl}" style="display: inline-block; background: #8C7340; color: #000; padding: 12px 32px; text-decoration: none; font-size: 14px; letter-spacing: 0.05em;">Access your portal</a>
          </div>
        `,
      });
    }

    revalidatePath("/app/clients");
    revalidatePath(`/portal/${client.portalSlug}`);

    return {
      clientId: client.id,
      portalSlug: client.portalSlug
    };
  });
}
