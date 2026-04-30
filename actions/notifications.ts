"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { NotificationType } from "@prisma/client";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import {
  getAblyRest,
  getAgencyNotificationsChannelName,
  getClientNotificationsChannelName
} from "@/lib/ably";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getDevAgencyNotifications,
  getDevClientNotifications,
  getDevSession,
  isDevBypass
} from "@/lib/dev-bypass";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
};

type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  agencyId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  userId?: string | null;
  clientUserId?: string | null;
  audience?: "agency" | "client" | "direct";
  clientSlug?: string | null;
};

const markNotificationSchema = z.object({
  notificationId: z.string().trim().min(1)
});

function serializeNotification(notification: {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: Date | string;
}): NotificationItem {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    read: notification.read,
    createdAt:
      typeof notification.createdAt === "string"
        ? notification.createdAt
        : notification.createdAt.toISOString()
  };
}

async function publishNotification(channelName: string, notification: NotificationItem) {
  try {
    const channel = getAblyRest().channels.get(channelName);
    await channel.publish("notification.created", notification);
  } catch {
    // Realtime is optional in local/dev environments without Ably credentials.
  }
}

export async function createNotification(input: CreateNotificationInput): Promise<NotificationItem[]> {
  if (isDevBypass()) {
    const notification: NotificationItem = {
      id: `dev-notification-${Date.now()}`,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      read: false,
      createdAt: new Date().toISOString()
    };

    if (input.audience === "client") {
      await publishNotification(getClientNotificationsChannelName(input.clientSlug ?? input.clientId ?? "northstar-brand"), notification);
    } else {
      await publishNotification(getAgencyNotificationsChannelName(input.agencyId ?? getDevSession().user.agencyId ?? "dev-agency-001"), notification);
    }

    return [notification];
  }

  if (input.audience === "agency" && input.agencyId) {
    const users = await prisma.user.findMany({
      where: { agencyId: input.agencyId },
      select: { id: true }
    });

    const created = await Promise.all(
      users.map((user) =>
        prisma.notification.create({
          data: {
            type: input.type,
            title: input.title,
            body: input.body,
            link: input.link,
            agencyId: input.agencyId,
            clientId: input.clientId ?? null,
            projectId: input.projectId ?? null,
            userId: user.id
          }
        })
      )
    );

    const serialized = created.map(serializeNotification);
    await publishNotification(getAgencyNotificationsChannelName(input.agencyId), serialized[0]);
    return serialized;
  }

  if (input.audience === "client" && input.clientId) {
    const clientUsers = await prisma.clientUser.findMany({
      where: { clientId: input.clientId },
      select: { id: true, client: { select: { portalSlug: true } } }
    });

    const created = await Promise.all(
      clientUsers.map((clientUser) =>
        prisma.notification.create({
          data: {
            type: input.type,
            title: input.title,
            body: input.body,
            link: input.link,
            agencyId: input.agencyId ?? null,
            clientId: input.clientId,
            projectId: input.projectId ?? null,
            clientUserId: clientUser.id
          }
        })
      )
    );

    const serialized = created.map(serializeNotification);
    await publishNotification(
      getClientNotificationsChannelName(input.clientSlug ?? clientUsers[0]?.client.portalSlug ?? input.clientId),
      serialized[0]
    );
    return serialized;
  }

  const created = await prisma.notification.create({
    data: {
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      agencyId: input.agencyId ?? null,
      clientId: input.clientId ?? null,
      projectId: input.projectId ?? null,
      userId: input.userId ?? null,
      clientUserId: input.clientUserId ?? null
    }
  });

  return [serializeNotification(created)];
}

export async function getAgencyNotificationsForShell(): Promise<NotificationItem[]> {
  if (isDevBypass()) {
    return getDevAgencyNotifications() as NotificationItem[];
  }

  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return notifications.map(serializeNotification);
  } catch {
    return [];
  }
}

export async function getAgencyNotificationChannelForShell(): Promise<string> {
  if (isDevBypass()) {
    return getAgencyNotificationsChannelName(getDevSession().user.agencyId ?? "dev-agency-001");
  }

  try {
    const session = await auth();
    return getAgencyNotificationsChannelName(session?.user?.agencyId ?? "unknown-agency");
  } catch {
    return getAgencyNotificationsChannelName("unknown-agency");
  }
}

export async function getClientNotificationsForShell(clientSlug: string): Promise<NotificationItem[]> {
  if (isDevBypass()) {
    return getDevClientNotifications() as NotificationItem[];
  }

  try {
    const clientUser = await prisma.clientUser.findFirst({
      where: { client: { portalSlug: clientSlug } },
      select: { id: true }
    });

    if (!clientUser) {
      return [];
    }

    const notifications = await prisma.notification.findMany({
      where: { clientUserId: clientUser.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return notifications.map(serializeNotification);
  } catch {
    return [];
  }
}

export async function getClientNotificationChannelForShell(clientSlug: string): Promise<string> {
  return getClientNotificationsChannelName(clientSlug);
}

export async function markNotificationReadAction(
  input: z.infer<typeof markNotificationSchema>
): Promise<ActionResult<{ notificationId: string }>> {
  return createSafeAction(async () => {
    const parsed = markNotificationSchema.parse(input);

    if (isDevBypass()) {
      return { notificationId: parsed.notificationId };
    }

    await prisma.notification.update({
      where: { id: parsed.notificationId },
      data: { read: true }
    });

    revalidatePath("/app");
    return { notificationId: parsed.notificationId };
  });
}

export async function markAllNotificationsReadAction(
  target: "agency" | "client",
  clientSlug?: string
): Promise<ActionResult<{ count: number }>> {
  return createSafeAction(async () => {
    if (isDevBypass()) {
      return { count: 0 };
    }

    if (target === "agency") {
      const session = await auth();
      if (!session?.user?.id) {
        throw new Error("You must be signed in.");
      }

      const result = await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true }
      });

      revalidatePath("/app");
      return { count: result.count };
    }

    const clientUser = await prisma.clientUser.findFirst({
      where: { client: { portalSlug: clientSlug } },
      select: { id: true }
    });

    if (!clientUser) {
      return { count: 0 };
    }

    const result = await prisma.notification.updateMany({
      where: { clientUserId: clientUser.id, read: false },
      data: { read: true }
    });

    revalidatePath(`/portal/${clientSlug}`);
    return { count: result.count };
  });
}
