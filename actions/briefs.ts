"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";

const saveBriefSchema = z.object({
  projectId: z.string().trim().min(1),
  title: z.string().trim().min(2, "Brief title is required."),
  content: z.any(),
  generatedByAi: z.boolean().default(false)
});

export async function saveBriefAction(
  _previousState: ActionResult<{ briefId: string }>,
  formData: FormData
): Promise<ActionResult<{ briefId: string }>> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in.");
    }

    const allowed = await checkPermission(session.user.id, "project:write");
    if (!allowed) {
      throw new Error("You do not have permission.");
    }

    const projectId = formData.get("projectId") as string;
    const title = formData.get("title") as string;
    const contentRaw = formData.get("content") as string;
    const generatedByAi = formData.get("generatedByAi") === "true";

    saveBriefSchema.parse({
      projectId,
      title,
      content: contentRaw ? JSON.parse(contentRaw) : {},
      generatedByAi
    });

    const project = await prisma.project.findFirst({
      where: { id: projectId, agencyId: session.user.agencyId },
      select: { id: true }
    });

    if (!project) {
      throw new Error("Project not found.");
    }

    const content = contentRaw ? JSON.parse(contentRaw) : {};

    const existing = await prisma.brief.findUnique({
      where: { projectId },
      select: { id: true }
    });

    let brief: { id: string };

    if (existing) {
      brief = await prisma.brief.update({
        where: { id: existing.id },
        data: { title, content }
      });
    } else {
      brief = await prisma.brief.create({
        data: {
          title,
          content,
          generatedByAi,
          projectId
        }
      });
    }

    revalidatePath(`/app/projects/${projectId}`);

    return { briefId: brief.id };
  });
}

export async function sendBriefAction(
  briefId: string
): Promise<ActionResult<{ briefId: string }>> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in.");
    }

    const allowed = await checkPermission(session.user.id, "project:write");
    if (!allowed) {
      throw new Error("You do not have permission.");
    }

    const brief = await prisma.brief.findFirst({
      where: {
        id: briefId,
        project: { agencyId: session.user.agencyId }
      },
      select: { id: true, projectId: true }
    });

    if (!brief) {
      throw new Error("Brief not found.");
    }

    await prisma.brief.update({
      where: { id: briefId },
      data: { status: "SENT" }
    });

    revalidatePath(`/app/projects/${brief.projectId}`);

    return { briefId };
  });
}
