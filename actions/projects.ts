"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";

const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required."),
  description: z.string().trim().min(10, "Description should be at least 10 characters."),
  clientId: z.string().trim().min(1, "Choose a client."),
  dueDate: z.string().trim().min(1, "Choose a due date."),
  status: z.enum(["DRAFT", "ACTIVE"])
});

export type CreateProjectState = ActionResult<{
  projectId: string;
  name: string;
}>;

export async function createProjectAction(
  _previousState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in to create a project.");
    }

    const allowed = await checkPermission(session.user.id, "project:write");

    if (!allowed) {
      throw new Error("You do not have permission to create projects.");
    }

    const input = createProjectSchema.parse({
      name: formData.get("name"),
      description: formData.get("description"),
      clientId: formData.get("clientId"),
      dueDate: formData.get("dueDate"),
      status: formData.get("status")
    });

    const client = await prisma.client.findFirst({
      where: {
        id: input.clientId,
        agencyId: session.user.agencyId
      },
      select: { id: true }
    });

    if (!client) {
      throw new Error("Client not found for this agency.");
    }

    const project = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description,
        status: input.status,
        dueDate: new Date(`${input.dueDate}T12:00:00.000Z`),
        agencyId: session.user.agencyId,
        clientId: client.id,
        createdById: session.user.id
      },
      select: {
        id: true,
        name: true
      }
    });

    revalidatePath("/app/projects");
    revalidatePath("/app/dashboard");

    return {
      projectId: project.id,
      name: project.name
    };
  });
}
