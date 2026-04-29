"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import { createNotification } from "@/actions/notifications";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isDevBypass } from "@/lib/dev-bypass";
import { checkPermission } from "@/lib/permissions";

const createDeliverableSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  description: z.string().trim().optional(),
  fileName: z.string().trim().min(1),
  fileSize: z.number().int().positive(),
  fileType: z.string().trim().min(1),
  projectId: z.string().trim().min(1)
});

const clientApprovalSchema = z.object({
  deliverableId: z.string().trim().min(1),
  clientSlug: z.string().trim().min(1)
});

const clientRejectSchema = clientApprovalSchema.extend({
  comment: z.string().trim().min(3, "Please describe what needs to change.")
});

export async function createDeliverableAction(
  _previousState: ActionResult<{ deliverableId: string }>,
  formData: FormData
): Promise<ActionResult<{ deliverableId: string }>> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in.");
    }

    const allowed = await checkPermission(session.user.id, "project:write");
    if (!allowed) {
      throw new Error("You do not have permission.");
    }

    const input = createDeliverableSchema.parse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      fileName: formData.get("fileName"),
      fileSize: Number(formData.get("fileSize")),
      fileType: formData.get("fileType"),
      projectId: formData.get("projectId")
    });

    const project = await prisma.project.findFirst({
      where: { id: input.projectId, agencyId: session.user.agencyId },
      select: { id: true }
    });

    if (!project) {
      throw new Error("Project not found.");
    }

    const deliverable = await prisma.deliverable.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        fileUrl: "",
        fileName: input.fileName,
        fileSize: input.fileSize,
        fileType: input.fileType,
        version: 1,
        status: "DRAFT",
        projectId: input.projectId,
        uploadedById: session.user.id
      },
      select: { id: true }
    });

    revalidatePath(`/app/projects/${input.projectId}`);

    return { deliverableId: deliverable.id };
  });
}

export async function approveClientDeliverableAction(
  input: z.infer<typeof clientApprovalSchema>
): Promise<ActionResult<{ deliverableId: string }>> {
  return createSafeAction(async () => {
    const parsed = clientApprovalSchema.parse(input);

    if (isDevBypass()) {
      await createNotification({
        type: "APPROVAL",
        title: "Deliverable approved",
        body: "The client approved a deliverable.",
        link: `/app/projects/${parsed.deliverableId}`,
        agencyId: "dev-agency-001",
        projectId: parsed.deliverableId,
        audience: "agency"
      });
      revalidatePath(`/portal/${parsed.clientSlug}`);
      return { deliverableId: parsed.deliverableId };
    }

    const deliverable = await prisma.deliverable.findFirst({
      where: {
        id: parsed.deliverableId,
        project: {
          client: {
            portalSlug: parsed.clientSlug
          }
        }
      },
      select: {
        id: true,
        title: true,
        projectId: true,
        project: {
          select: {
            name: true,
            agencyId: true,
            clientId: true,
            client: {
              select: {
                clientUsers: {
                  orderBy: { createdAt: "asc" },
                  select: { id: true },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    if (!deliverable) {
      throw new Error("Deliverable not found.");
    }

    await prisma.deliverable.update({
      where: { id: deliverable.id },
      data: {
        status: "APPROVED",
        approvedById: deliverable.project.client.clientUsers[0]?.id ?? null,
        approvedAt: new Date()
      }
    });

    revalidatePath(`/portal/${parsed.clientSlug}`);
    revalidatePath(`/portal/${parsed.clientSlug}/projects/${deliverable.projectId}`);
    revalidatePath(`/app/projects/${deliverable.projectId}`);

    await createNotification({
      type: "APPROVAL",
      title: "Deliverable approved",
      body: `${deliverable.title} was approved from the client portal.`,
      link: `/app/projects/${deliverable.projectId}`,
      agencyId: deliverable.project.agencyId,
      clientId: deliverable.project.clientId,
      projectId: deliverable.projectId,
      audience: "agency"
    });

    return { deliverableId: deliverable.id };
  });
}

export async function requestClientChangesAction(
  input: z.infer<typeof clientRejectSchema>
): Promise<ActionResult<{ deliverableId: string }>> {
  return createSafeAction(async () => {
    const parsed = clientRejectSchema.parse(input);

    if (isDevBypass()) {
      await createNotification({
        type: "APPROVAL",
        title: "Changes requested",
        body: parsed.comment,
        link: `/app/projects/${parsed.deliverableId}`,
        agencyId: "dev-agency-001",
        projectId: parsed.deliverableId,
        audience: "agency"
      });
      revalidatePath(`/portal/${parsed.clientSlug}`);
      return { deliverableId: parsed.deliverableId };
    }

    const deliverable = await prisma.deliverable.findFirst({
      where: {
        id: parsed.deliverableId,
        project: {
          client: {
            portalSlug: parsed.clientSlug
          }
        }
      },
      select: {
        id: true,
        title: true,
        projectId: true,
        project: {
          select: {
            agencyId: true,
            clientId: true,
            client: {
              select: {
                clientUsers: {
                  orderBy: { createdAt: "asc" },
                  select: { id: true },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    if (!deliverable) {
      throw new Error("Deliverable not found.");
    }

    const clientUserId = deliverable.project.client.clientUsers[0]?.id ?? null;

    await prisma.$transaction([
      prisma.deliverable.update({
        where: { id: deliverable.id },
        data: {
          status: "REJECTED",
          approvedById: null,
          approvedAt: null
        }
      }),
      prisma.comment.create({
        data: {
          body: parsed.comment,
          projectId: deliverable.projectId,
          deliverableId: deliverable.id,
          authorClientUserId: clientUserId,
          isInternal: false
        }
      })
    ]);

    revalidatePath(`/portal/${parsed.clientSlug}`);
    revalidatePath(`/portal/${parsed.clientSlug}/projects/${deliverable.projectId}`);
    revalidatePath(`/app/projects/${deliverable.projectId}`);

    await createNotification({
      type: "APPROVAL",
      title: "Changes requested",
      body: `${deliverable.title}: ${parsed.comment}`,
      link: `/app/projects/${deliverable.projectId}`,
      agencyId: deliverable.project.agencyId,
      clientId: deliverable.project.clientId,
      projectId: deliverable.projectId,
      audience: "agency"
    });

    return { deliverableId: deliverable.id };
  });
}

export async function requestApprovalAction(
  deliverableId: string
): Promise<ActionResult<{ deliverableId: string }>> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in.");
    }

    const allowed = await checkPermission(session.user.id, "project:write");
    if (!allowed) {
      throw new Error("You do not have permission.");
    }

    const deliverable = await prisma.deliverable.findFirst({
      where: {
        id: deliverableId,
        project: { agencyId: session.user.agencyId }
      },
      select: {
        id: true,
        title: true,
        projectId: true,
        project: {
          select: {
            id: true,
            agencyId: true,
            clientId: true,
            client: { select: { portalSlug: true } }
          }
        }
      }
    });

    if (!deliverable) {
      throw new Error("Deliverable not found.");
    }

    await prisma.deliverable.update({
      where: { id: deliverableId },
      data: { status: "PENDING_REVIEW" }
    });

    revalidatePath(`/app/projects/${deliverable.projectId}`);

    await createNotification({
      type: "DELIVERABLE_UPLOADED",
      title: "Deliverable ready for review",
      body: `${deliverable.title} is waiting for your approval.`,
      link: `/portal/${deliverable.project.client.portalSlug}/projects/${deliverable.projectId}`,
      agencyId: deliverable.project.agencyId,
      clientId: deliverable.project.clientId,
      projectId: deliverable.projectId,
      audience: "client",
      clientSlug: deliverable.project.client.portalSlug
    });

    return { deliverableId };
  });
}

export async function deleteDeliverableAction(
  deliverableId: string
): Promise<ActionResult<{ deliverableId: string }>> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in.");
    }

    const allowed = await checkPermission(session.user.id, "project:write");
    if (!allowed) {
      throw new Error("You do not have permission.");
    }

    const deliverable = await prisma.deliverable.findFirst({
      where: {
        id: deliverableId,
        project: { agencyId: session.user.agencyId }
      },
      select: { id: true, projectId: true }
    });

    if (!deliverable) {
      throw new Error("Deliverable not found.");
    }

    await prisma.deliverable.delete({ where: { id: deliverableId } });

    revalidatePath(`/app/projects/${deliverable.projectId}`);

    return { deliverableId };
  });
}
