import { notFound } from "next/navigation";
import {
  getClientNotificationChannelForShell,
  getClientNotificationsForShell
} from "@/actions/notifications";
import { isDevBypass, getDevPortalAgency, getDevPortalClient } from "@/lib/dev-bypass";
import { prisma } from "@/lib/db";
import { PortalShell } from "@/components/client/portal-shell";

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
        {children}
      </PortalShell>
    );
  }

  const client = await prisma.client.findUnique({
    where: { portalSlug: clientSlug },
    select: {
      companyName: true,
      portalSlug: true,
      agency: {
        select: {
          name: true,
          brandColor: true
        }
      }
    }
  });

  if (!client?.agency) {
    notFound();
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
      {children}
    </PortalShell>
  );
}
