import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  getClientNotificationChannelForShell,
  getClientNotificationsForShell
} from "@/actions/notifications";
import { isDevBypass, getDevPortalAgency, getDevPortalClient } from "@/lib/dev-bypass";
import { prisma } from "@/lib/db";
import { PortalShell } from "@/components/client/portal-shell";
import { PortalSessionProvider } from "@/components/client/portal-session-provider";

export default async function PortalLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const notifications = await getClientNotificationsForShell(clientSlug);
  const notificationChannel = await getClientNotificationChannelForShell(clientSlug);

  if (isDevBypass()) {
    const agency = getDevPortalAgency();
    const client = getDevPortalClient(clientSlug);
    if (!client) {
      notFound();
    }

    return (
      <PortalShell
        agencyBrandColor={agency.brandColor}
        agencyName={agency.name}
        clientName={client.companyName}
        initialNotifications={notifications}
        notificationChannel={notificationChannel}
        portalSlug={clientSlug}
      >
        <PortalSessionProvider portalSlug={clientSlug}>
          {children}
        </PortalSessionProvider>
      </PortalShell>
    );
  }

  try {
    const client = await prisma.client.findUnique({
      where: { portalSlug: clientSlug },
      select: {
        companyName: true,
        portalSlug: true,
        agency: {
          select: {
            name: true,
            brandColor: true,
            slug: true,
            plan: true,
          }
        }
      }
    });

    if (!client?.agency) {
      notFound();
    }

    // Studio plan agencies cannot use subdomain routing — redirect to apex
    if (client.agency.plan === "STUDIO") {
      const h = await headers();
      const host = h.get("host") ?? "";
      const isSubdomain = host.split(".").length >= 3 && !host.startsWith("www.");
      if (isSubdomain) {
        const apexUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://portalos.tech").replace(/\/$/, "");
        redirect(`${apexUrl}/portal/${clientSlug}`);
      }
    }

    return (
      <PortalShell
        agencyBrandColor={client.agency.brandColor}
        agencyName={client.agency.name}
        clientName={client.companyName}
        initialNotifications={notifications}
        notificationChannel={notificationChannel}
        portalSlug={client.portalSlug}
      >
        <PortalSessionProvider portalSlug={client.portalSlug}>
          {children}
        </PortalSessionProvider>
      </PortalShell>
    );
  } catch {
    notFound();
  }
}
