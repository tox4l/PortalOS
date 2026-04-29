"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";

const createTaskSchema = z.object({
  title: z.string().trim().min(2, "Task title is required."),
  description: z.string().trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
  dueDate: z.string().trim().optional(),
  assigneeId: z.string().trim().optional(),
  projectId: z.string().trim().min(1)
});

const updateTaskSchema = z.object({
  taskId: z.string().trim().min(1),
  title: z.string().trim().min(2, "Task title is required."),
  description: z.string().trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().trim().optional(),
  assigneeId: z.string().trim().optional()
});

export async function createTaskAction(
  _previousState: ActionResult<{ taskId: string }>,
  formData: FormData
): Promise<ActionResult<{ taskId: string }>> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in.");
    }

    const allowed = await checkPermission(session.user.id, "project:write");
    if (!allowed) {
      throw new Error("You do not have permission.");
    }

    const input = createTaskSchema.parse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      priority: formData.get("priority") || "MEDIUM",
      status: formData.get("status") || "TODO",
      dueDate: formData.get("dueDate") || undefined,
      assigneeId: formData.get("assigneeId") || undefined,
      projectId: formData.get("projectId")
    });

    const project = await prisma.project.findFirst({
      where: { id: input.projectId, agencyId: session.user.agencyId },
      select: { id: true }
    });

    if (!project) {
      throw new Error("Project not found.");
    }

    if (input.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: { id: input.assigneeId, agencyId: session.user.agencyId },
        select: { id: true }
      });
      if (!assignee) {
        throw new Error("Assignee not found.");
      }
    }

    const maxPosition = await prisma.task.aggregate({
      where: { projectId: input.projectId, status: input.status },
      _max: { position: true }
    });

    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
        status: input.status,
        position: (maxPosition._max.position ?? 0) + 1,
        dueDate: input.dueDate ? new Date(`${input.dueDate}T12:00:00.000Z`) : null,
        projectId: input.projectId,
        assigneeId: input.assigneeId ?? null
      },
      select: { id: true }
    });

    revalidatePath(`/app/projects/${input.projectId}`);

    return { taskId: task.id };
  });
}

export async function updateTaskStatusAction(
  taskId: string,
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
  position: number
): Promise<ActionResult<{ taskId: string }>> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in.");
    }

    const allowed = await checkPermission(session.user.id, "project:write");
    if (!allowed) {
      throw new Error("You do not have permission.");
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: { agencyId: session.user.agencyId }
      },
      select: { id: true, projectId: true }
    });

    if (!task) {
      throw new Error("Task not found.");
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { status, position }
    });

    revalidatePath(`/app/projects/${task.projectId}`);

    return { taskId };
  });
}

export async function updateTaskAction(
  _previousState: ActionResult<{ taskId: string }>,
  formData: FormData
): Promise<ActionResult<{ taskId: string }>> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in.");
    }

    const allowed = await checkPermission(session.user.id, "project:write");
    if (!allowed) {
      throw new Error("You do not have permission.");
    }

    const input = updateTaskSchema.parse({
      taskId: formData.get("taskId"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      priority: formData.get("priority"),
      dueDate: formData.get("dueDate") || undefined,
      assigneeId: formData.get("assigneeId") || undefined
    });

    const task = await prisma.task.findFirst({
      where: {
        id: input.taskId,
        project: { agencyId: session.user.agencyId }
      },
      select: { id: true, projectId: true }
    });

    if (!task) {
      throw new Error("Task not found.");
    }

    if (input.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: { id: input.assigneeId, agencyId: session.user.agencyId },
        select: { id: true }
      });
      if (!assignee) {
        throw new Error("Assignee not found.");
      }
    }

    await prisma.task.update({
      where: { id: input.taskId },
      data: {
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(`${input.dueDate}T12:00:00.000Z`) : null,
        assigneeId: input.assigneeId ?? null
      }
    });

    revalidatePath(`/app/projects/${task.projectId}`);

    return { taskId: task.id };
  });
}

export async function deleteTaskAction(
  taskId: string
): Promise<ActionResult<{ taskId: string }>> {
  return createSafeAction(async () => {
    const session = await auth();

    if (!session?.user?.id || !session.user.agencyId) {
      throw new Error("You must be signed in.");
    }

    const allowed = await checkPermission(session.user.id, "project:write");
    if (!allowed) {
      throw new Error("You do not have permission.");
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: { agencyId: session.user.agencyId }
      },
      select: { id: true, projectId: true }
    });

    if (!task) {
      throw new Error("Task not found.");
    }

    await prisma.task.delete({ where: { id: taskId } });

    revalidatePath(`/app/projects/${task.projectId}`);

    return { taskId };
  });
}
