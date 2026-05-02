import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTeamPageData } from "@/actions/team";
import { TeamSettingsClient } from "./team-client";

export default async function TeamSettingsPage() {
  const session = await auth();
  if (!session?.user?.agencyId) redirect("/login");

  const data = await getTeamPageData(session.user.agencyId);

  return (
    <TeamSettingsClient
      members={data.members}
      invitations={data.invitations}
      plan={data.plan}
      teamSeatsUsed={data.teamSeatsUsed}
      teamSeatsMax={data.teamSeatsMax}
      canInvite={data.canInvite}
      currentUserId={session.user.id}
      currentUserRole={session.user.role}
    />
  );
}
