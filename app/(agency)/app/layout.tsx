import { getAgencyNotificationChannelForShell, getAgencyNotificationsForShell } from "@/actions/notifications";
import { AgencyShell } from "@/components/agency/agency-shell";

export default async function AgencyLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const notifications = await getAgencyNotificationsForShell();
  const notificationChannel = await getAgencyNotificationChannelForShell();

  return (
    <AgencyShell initialNotifications={notifications} notificationChannel={notificationChannel}>
      {children}
    </AgencyShell>
  );
}
