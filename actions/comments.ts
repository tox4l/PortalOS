"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import { createNotification } from "@/actions/notifications";
import { auth } from "@/lib/auth";
import { getClientSession } from "@/lib/client-sessions";
import { prisma } from "@/lib/db";
import { isDevBypass } from "@/lib/dev-bypass";
import { checkPermission } from "@/lib/permissions";

const createCommentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty."),
  projectId: z.string().trim().min(1),
  isInternal: z.boolean().default(false)
});

const createClientCommentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty."),
  projectId: z.string().trim().min(1),
  clientSlug: z.string().trim().min(1)
});

export async function createCommentAction(
  _previousState: ActionResult<{ commentId: string }>,
  formData: FormData
): Promise<ActionResult<{ commentId: string }>> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in.");
    }

    const allowed = await checkPermission(session.user.id, "project:write");
    if (!allowed) {
      throw new Error("You do not have permission.");
    }

    const input = createCommentSchema.parse({
      body: formData.get("body"),
      projectId: formData.get("projectId"),
      isInternal: formData.get("isInternal") === "true"
    });

    const project = await prisma.project.findFirst({
      where: { id: input.projectId, agencyId: session.user.agencyId },
      select: {
        id: true,
        name: true,
        agencyId: true,
        clientId: true,
        client: { select: { portalSlug: true } }
      }
    });

    if (!project) {
      throw new Error("Project not found.");
    }

    const comment = await prisma.comment.create({
      data: {
        body: input.body,
        projectId: input.projectId,
        authorUserId: session.user.id,
        isInternal: input.isInternal
      },
      select: {
        id: true,
        createdAt: true,
        body: true,
        isInternal: true,
        authorUser: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    revalidatePath(`/app/projects/${input.projectId}`);

    if (!input.isInternal) {
      await createNotification({
        type: "COMMENT",
        title: "New team comment",
        body: `${session.user.name ?? "Your agency"} commented on ${project.name}.`,
        link: `/portal/${project.client.portalSlug}/projects/${project.id}`,
        agencyId: project.agencyId,
        clientId: project.clientId,
        projectId: project.id,
        audience: "client",
        clientSlug: project.client.portalSlug
      });
    }

    return { commentId: comment.id };
  });
}

export async function createClientCommentAction(
  input: z.infer<typeof createClientCommentSchema>
): Promise<ActionResult<{ commentId: string }>> {
  return createSafeAction(async () => {
    const parsed = createClientCommentSchema.parse(input);

    if (isDevBypass()) {
      await createNotification({
        type: "COMMENT",
        title: "New client comment",
        body: parsed.body,
        link: `/app/projects/${parsed.projectId}`,
        agencyId: "dev-agency-001",
        projectId: parsed.projectId,
        audience: "agency"
      });

      return { commentId: `dev-comment-${Date.now()}` };
    }

    const clientSession = await getClientSession();
    if (!clientSession || clientSession.clientSlug !== parsed.clientSlug) {
      throw new Error("You must be signed in to comment.");
    }

    const project = await prisma.project.findFirst({
      where: {
        id: parsed.projectId,
        client: { portalSlug: parsed.clientSlug }
      },
      select: {
        id: true,
        name: true,
        agencyId: true,
        clientId: true,
      }
    });

    if (!project) {
      throw new Error("Project not found.");
    }

    const comment = await prisma.comment.create({
      data: {
        body: parsed.body,
        projectId: project.id,
        authorClientUserId: clientSession.clientUserId,
        isInternal: false
      },
      select: { id: true }
    });

    await createNotification({
      type: "COMMENT",
      title: "New client comment",
      body: `A client commented on ${project.name}.`,
      link: `/app/projects/${project.id}`,
      agencyId: project.agencyId,
      clientId: project.clientId,
      projectId: project.id,
      audience: "agency"
    });

    revalidatePath(`/portal/${parsed.clientSlug}/projects/${project.id}`);
    revalidatePath(`/app/projects/${project.id}`);

    return { commentId: comment.id };
  });
}
