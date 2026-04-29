"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";

const createClientSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required."),
  contactName: z.string().trim().min(2, "Contact name is required."),
  contactEmail: z.string().trim().email("Enter a valid contact email."),
  portalSlug: z
    .string()
    .trim()
    .min(2, "Portal slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  welcomeMessage: z.string().trim().min(10, "Welcome message should be at least 10 characters.")
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

    revalidatePath("/app/clients");
    revalidatePath(`/portal/${client.portalSlug}`);

    return {
      clientId: client.id,
      portalSlug: client.portalSlug
    };
  });
}
