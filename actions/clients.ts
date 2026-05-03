"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { checkClientSeatAvailable } from "@/lib/plan-limits";
import { generateInviteToken, inviteExpiresAt } from "@/lib/invite-tokens";
import { sanitizeEmail } from "@/lib/sanitize";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import { isDevBypass } from "@/lib/dev-bypass";
import { checkRateLimit } from "@/lib/action-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import {
  buildClientAuthUrl,
  renderClientWelcomeEmail,
  sendEmail,
} from "@/lib/email";

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

    await checkRateLimit("clients/create", RATE_LIMITS.MAGIC_LINK);

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

      const magicLinkUrl = buildClientAuthUrl(client.portalSlug, raw, input.contactEmail, {
        plan: session.user.agencyPlan,
        agencySlug: session.user.agencySlug,
      });

      await sendEmail(
        input.contactEmail,
        `Welcome to your portal — ${input.companyName}`,
        renderClientWelcomeEmail({
          agency: {
            name: session.user.agencyName ?? "Your Agency",
            brandColor: session.user.agencyBrandColor,
          },
          contactName: input.contactName,
          companyName: input.companyName,
          magicLinkUrl,
        })
      );
    }

    revalidatePath("/app/clients");
    revalidatePath(`/portal/${client.portalSlug}`);

    return {
      clientId: client.id,
      portalSlug: client.portalSlug
    };
  });
}
