import { getAgencyNotificationChannelForShell, getAgencyNotificationsForShell } from "@/actions/notifications";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AgencyShell } from "@/components/agency/agency-shell";

export default async function AgencyLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const notifications = await getAgencyNotificationsForShell();
  const notificationChannel = await getAgencyNotificationChannelForShell();

  let agencyName: string | null = null;
  let agencyBrandColor: string | null = null;
  let userName: string | null = null;
  let userInitials = "??";

  if (session?.user?.agencyId) {
    const agency = await prisma.agency.findUnique({
      where: { id: session.user.agencyId },
      select: { name: true, brandColor: true },
    });
    agencyName = agency?.name ?? null;
    agencyBrandColor = agency?.brandColor ?? null;
  }

  if (session?.user?.name) {
    userName = session.user.name;
    userInitials = session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  } else if (session?.user?.email) {
    userInitials = session.user.email[0].toUpperCase();
  }

  return (
    <AgencyShell
      agencyBrandColor={agencyBrandColor}
      agencyName={agencyName}
      initialNotifications={notifications}
      notificationChannel={notificationChannel}
      userInitials={userInitials}
      userName={userName}
    >
      {children}
    </AgencyShell>
  );
}
