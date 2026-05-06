import { prisma } from "@/lib/db";
import { ActivityEventType } from "@prisma/client";

interface CreateActivityEventParams {
  type: ActivityEventType;
  title: string;
  body: string;
  link: string;
  agencyId: string;
  clientId?: string;
  projectId?: string | null;
  actorUserId?: string | null;
  actorClientUserId?: string | null;
}

export async function createActivityEvent(params: CreateActivityEventParams) {
  return prisma.activityEvent.create({
    data: {
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      agencyId: params.agencyId,
      clientId: params.clientId ?? null,
      projectId: params.projectId ?? null,
      actorUserId: params.actorUserId ?? null,
      actorClientUserId: params.actorClientUserId ?? null,
    },
  });
}

export async function getActivityFeed(agencyId: string, limit = 20) {
  return prisma.activityEvent.findMany({
    where: { agencyId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      link: true,
      createdAt: true,
      projectId: true,
      actorUser: { select: { id: true, name: true, image: true } },
      actorClientUser: { select: { id: true, name: true } },
    },
  });
}

export async function getClientActivityFeed(clientId: string, limit = 20) {
  return prisma.activityEvent.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      link: true,
      createdAt: true,
      projectId: true,
      actorUser: { select: { id: true, name: true, image: true } },
      actorClientUser: { select: { id: true, name: true } },
    },
  });
}
