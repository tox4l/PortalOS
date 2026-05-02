"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import { sanitizeSlug, sanitizeText } from "@/lib/sanitize";
import { isDevBypass } from "@/lib/dev-bypass";

// ─── Create Agency ───

const createAgencySchema = z.object({
  name: z.string().trim().min(2, "Agency name is required."),
  slug: z
    .string()
    .trim()
    .min(2, "Portal URL is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
});

export async function createAgencyAction(
  _prevState: ActionResult<{ agencyId: string; slug: string }>,
  formData: FormData
): Promise<ActionResult<{ agencyId: string; slug: string }>> {
  return createSafeAction(async () => {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You must be signed in.");

    const input = createAgencySchema.parse({
      name: sanitizeText(formData.get("name") as string),
      slug: sanitizeSlug(formData.get("slug") as string),
    });

    if (isDevBypass()) {
      return { agencyId: "dev-agency-001", slug: input.slug };
    }

    const existing = await prisma.agency.findUnique({ where: { slug: input.slug }, select: { id: true } });
    if (existing) throw new Error("That portal URL is already taken. Try another.");

    const agency = await prisma.agency.create({
      data: {
        name: input.name,
        slug: input.slug,
        users: {
          connect: { id: session.user.id },
        },
      },
      select: { id: true, slug: true },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "OWNER", agencyId: agency.id },
    });

    revalidatePath("/app/dashboard");
    return { agencyId: agency.id, slug: agency.slug };
  });
}

// ─── Save Branding ───

const brandingSchema = z.object({
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color."),
  logoUrl: z.string().optional(),
});

export async function saveBrandingAction(
  agencyId: string,
  _prevState: ActionResult<void>,
  formData: FormData
): Promise<ActionResult<void>> {
  return createSafeAction(async () => {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You must be signed in.");

    if (isDevBypass()) return;

    const agency = await prisma.agency.findUniqueOrThrow({
      where: { id: agencyId },
      select: { id: true },
    });

    const input = brandingSchema.parse({
      brandColor: formData.get("brandColor"),
      logoUrl: formData.get("logoUrl") || undefined,
    });

    await prisma.agency.update({
      where: { id: agencyId },
      data: {
        brandColor: input.brandColor,
        ...(input.logoUrl ? { logoUrl: input.logoUrl } : {}),
      },
    });

    revalidatePath("/app/settings/branding");
  });
}

// ─── Complete Onboarding ───

export async function completeOnboardingAction(
  agencyId: string
): Promise<ActionResult<void>> {
  return createSafeAction(async () => {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You must be signed in.");

    if (isDevBypass()) return;

    await prisma.agency.findUniqueOrThrow({
      where: { id: agencyId },
      select: { id: true },
    });

    revalidatePath("/app/dashboard");
    revalidatePath("/app/settings");
  });
}
