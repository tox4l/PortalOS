"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createFormAction, createAction, type ActionResult } from "@/actions/safe-action";
import { prisma } from "@/lib/db";

const createTaskSchema = z.object({
  title: z.string().trim().min(2, "Task title is required."),
  description: z.string().trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
  dueDate: z.string().trim().optional(),
  assigneeId: z.string().trim().optional(),
  projectId: z.string().trim().min(1),
});

const updateTaskSchema = z.object({
  taskId: z.string().trim().min(1),
  title: z.string().trim().min(2, "Task title is required."),
  description: z.string().trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().trim().optional(),
  assigneeId: z.string().trim().optional(),
});

export const createTaskAction = createFormAction<{ taskId: string }>({
  name: "createTask",
  permission: "project:write",
  schema: createTaskSchema,
  async handler(input, ctx) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId as string, agencyId: ctx.agencyId },
      select: { id: true },
    });

    if (!project) throw new Error("Project not found.");

    if (input.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: { id: input.assigneeId as string, agencyId: ctx.agencyId },
        select: { id: true },
      });
      if (!assignee) throw new Error("Assignee not found.");
    }

    const taskStatus = input.status as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

    const maxPosition = await prisma.task.aggregate({
      where: { projectId: input.projectId as string, status: taskStatus },
      _max: { position: true },
    });

    const task = await prisma.task.create({
      data: {
        title: input.title as string,
        description: (input.description as string) ?? null,
        priority: input.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        status: taskStatus,
        position: ((maxPosition._max?.position ?? 0) + 1),
        dueDate: input.dueDate ? new Date(`${input.dueDate}T12:00:00.000Z`) : null,
        projectId: input.projectId as string,
        assigneeId: (input.assigneeId as string) ?? null,
      },
      select: { id: true },
    });

    revalidatePath(`/app/projects/${input.projectId}`);

    return { taskId: task.id };
  },
});

export const updateTaskStatusAction = createAction<
  { taskId: string; status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"; position: number },
  { taskId: string }
>({
  name: "updateTaskStatus",
  permission: "project:write",
  schema: z.object({
    taskId: z.string().min(1),
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
    position: z.number(),
  }),
  async handler(input, ctx) {
    const task = await prisma.task.findFirst({
      where: { id: input.taskId, project: { agencyId: ctx.agencyId } },
      select: { id: true, projectId: true },
    });

    if (!task) throw new Error("Task not found.");

    await prisma.task.update({
      where: { id: input.taskId },
      data: { status: input.status, position: input.position },
    });

    revalidatePath(`/app/projects/${task.projectId}`);

    return { taskId: task.id };
  },
});

export const updateTaskAction = createFormAction<{ taskId: string }>({
  name: "updateTask",
  permission: "project:write",
  schema: updateTaskSchema,
  async handler(input, ctx) {
    const taskId = input.taskId as string;
    const task = await prisma.task.findFirst({
      where: { id: taskId, project: { agencyId: ctx.agencyId } },
      select: { id: true, projectId: true },
    });

    if (!task) throw new Error("Task not found.");

    if (input.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: { id: input.assigneeId as string, agencyId: ctx.agencyId },
        select: { id: true },
      });
      if (!assignee) throw new Error("Assignee not found.");
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        title: input.title as string,
        description: (input.description as string) ?? null,
        priority: input.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        dueDate: input.dueDate ? new Date(`${input.dueDate}T12:00:00.000Z`) : null,
        assigneeId: (input.assigneeId as string) ?? null,
      },
    });

    revalidatePath(`/app/projects/${task.projectId}`);

    return { taskId: task.id };
  },
});

export const deleteTaskAction = createAction<string, { taskId: string }>({
  name: "deleteTask",
  permission: "project:write",
  schema: z.string().min(1),
  async handler(taskId, ctx) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, project: { agencyId: ctx.agencyId } },
      select: { id: true, projectId: true },
    });

    if (!task) throw new Error("Task not found.");

    await prisma.task.delete({ where: { id: taskId } });

    revalidatePath(`/app/projects/${task.projectId}`);

    return { taskId };
  },
});
