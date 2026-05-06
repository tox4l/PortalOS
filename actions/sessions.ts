"use server";

import { createAction, type ActionResult } from "@/actions/safe-action";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revokeAllClientSessions } from "@/lib/client-sessions";

export const getActiveSessions = createAction<void, Array<{
  id: string;
  createdAt: Date;
  expires: Date;
  isCurrent: boolean;
}>>({
  name: "getActiveSessions",
  async handler(_input, ctx) {
    const session = await auth();
    const sessionToken =
      session?.user?.id
        ? undefined
        : undefined;

    const sessions = await prisma.session.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, sessionToken: true, createdAt: true, expires: true },
    });

    return sessions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      expires: s.expires,
      isCurrent: s.sessionToken !== sessionToken,
    }));
  },
});

export const revokeSession = createAction<string, void>({
  name: "revokeSession",
  async handler(sessionId, ctx) {
    await prisma.session.deleteMany({
      where: { id: sessionId, userId: ctx.userId },
    });
  },
});

export const revokeAllSessions = createAction<void, void>({
  name: "revokeAllSessions",
  async handler(_input, ctx) {
    const session = await auth();
    const currentToken = (session as unknown as Record<string, unknown>)?.sessionToken as string | undefined;

    await prisma.session.deleteMany({
      where: {
        userId: ctx.userId,
        ...(currentToken ? { sessionToken: { not: currentToken } } : {}),
      },
    });

    await revokeAllClientSessions(ctx.userId);
  },
});

export type { ActionResult };
