import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientSession } from "@/lib/client-sessions";
import { prisma } from "@/lib/db";
import { getDeliverableSignedUrl } from "@/lib/supabase";
import { applyRateLimit, API_RATE_LIMITS } from "@/lib/api-rate-limit";
import { logger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deliverableId: string }> }
) {
  try {
    const { deliverableId } = await params;

    // Apply rate limiting per-deliverable to prevent signed URL abuse
    const limited = await applyRateLimit(request, `download:${deliverableId}`, { windowMs: 60 * 1000, maxRequests: 20 });
    if (limited) return limited;

    // Try agency session first, then client session
    const session = await auth();
    const clientSession = await getClientSession();

    if (!session?.user?.agencyId && !clientSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deliverable = await prisma.deliverable.findUnique({
      where: { id: deliverableId },
      select: {
        id: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
        project: {
          select: {
            agencyId: true,
            client: { select: { portalSlug: true } },
          },
        },
      },
    });

    if (!deliverable || !deliverable.fileUrl) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Agency user: verify they belong to the deliverable's agency
    if (session?.user?.agencyId) {
      if (deliverable.project.agencyId !== session.user.agencyId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Client user: verify they belong to the deliverable's client portal
    if (clientSession) {
      if (deliverable.project.client.portalSlug !== clientSession.clientSlug) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const signedUrl = await getDeliverableSignedUrl(deliverable.fileUrl);

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    logger.error("deliverable download error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
