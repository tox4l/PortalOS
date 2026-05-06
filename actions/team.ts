"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/permissions";
import { requireAgencyAdmin } from "@/lib/authz";
import { getPlanLimits, checkTeamSeatAvailable } from "@/lib/plan-limits";
import { generateInviteToken, inviteExpiresAt } from "@/lib/invite-tokens";
import { sanitizeEmail } from "@/lib/sanitize";
import { createSafeAction, type ActionResult } from "@/actions/safe-action";
import { isDevBypass, getDevTeamMembers, getDevPendingInvitations } from "@/lib/dev-bypass";
import { checkRateLimit } from "@/lib/action-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import {
  checkInviteeAvailability,
  prepareInvitation,
} from "@/lib/domain/services/invitation-service";
import {
  buildAcceptInviteUrl,
  renderTeamInvitationEmail,
  sendEmail,
} from "@/lib/email";

// ─── Types ───

export type TeamMember = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  joinedAt: string;
};

export type PendingInvitation = {
  id: string;
  email: string;
  role: string;
  invitedByName: string | null;
  expiresAt: string;
};

// ─── Queries ───

export async function getTeamMembers(agencyId: string): Promise<TeamMember[]> {
  if (isDevBypass()) return getDevTeamMembers();

  const users = await prisma.user.findMany({
    where: { agencyId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role,
    joinedAt: u.createdAt.toISOString(),
  }));
}

export async function getPendingInvitations(agencyId: string): Promise<PendingInvitation[]> {
  if (isDevBypass()) return getDevPendingInvitations();

  const invites = await prisma.teamInvitation.findMany({
    where: {
      agencyId,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      invitedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return invites.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    invitedByName: inv.invitedBy.name,
    expiresAt: inv.expiresAt.toISOString(),
  }));
}

export async function getTeamPageData(agencyId: string) {
  const [members, invitations, agency] = await Promise.all([
    getTeamMembers(agencyId),
    getPendingInvitations(agencyId),
    isDevBypass()
      ? Promise.resolve({ plan: "GROWTH" as const, _count: { users: 3, clients: 3 } })
      : prisma.agency.findUniqueOrThrow({
          where: { id: agencyId },
          select: {
            plan: true,
            _count: { select: { users: true, clients: { where: { status: "ACTIVE" } } } },
          },
        }),
  ]);

  const limits = getPlanLimits(agency.plan);

  const unlimitedTeam = !Number.isFinite(limits.maxTeamMembers);
  const unlimitedClients = !Number.isFinite(limits.maxClients);

  return {
    members,
    invitations,
    plan: agency.plan,
    teamSeatsUsed: agency._count.users,
    teamSeatsMax: unlimitedTeam ? agency._count.users : limits.maxTeamMembers,
    clientSeatsUsed: agency._count.clients,
    clientSeatsMax: unlimitedClients ? agency._count.clients : limits.maxClients,
    canInvite: unlimitedTeam || agency._count.users < limits.maxTeamMembers,
    canCreateClient: unlimitedClients || agency._count.clients < limits.maxClients,
  };
}

// ─── Mutations ───

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export async function inviteTeamMemberAction(
  _prevState: ActionResult<{ invitationId: string }>,
  formData: FormData
): Promise<ActionResult<{ invitationId: string }>> {
  return createSafeAction(async () => {
    const session = await auth();
    if (!session?.user?.id || !session.user.agencyId) throw new Error("Unauthorized");

    const { agencyId, id: invitedById } = session.user;

    await requireAgencyAdmin(agencyId);

    const parsed = inviteSchema.safeParse({
      email: sanitizeEmail(formData.get("email") as string),
      role: formData.get("role"),
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0].message);

    const { email, role } = parsed.data;

    if (isDevBypass()) {
      return { invitationId: `dev-invite-${Date.now()}` };
    }

    await checkRateLimit("team/invite", RATE_LIMITS.MAGIC_LINK);

    const agency = await prisma.agency.findUniqueOrThrow({
      where: { id: agencyId },
      include: { _count: { select: { users: true } } },
    });

    const seatCheck = checkTeamSeatAvailable(agency.plan, agency._count.users);
    if (!seatCheck.allowed) throw new Error(seatCheck.reason);

    // Use shared invitation service for availability checks
    const availability = await checkInviteeAvailability("teamInvitation", "agencyId", agencyId, email);
    if (availability.status === "exists") {
      throw new Error("A team member with this email already exists.");
    }
    if (availability.status === "duplicate_invite") {
      throw new Error("An invitation has already been sent to this email.");
    }

    // Use shared invitation service for token generation
    const { raw, hashed, expiresAt } = await prepareInvitation();

    await prisma.teamInvitation.upsert({
      where: { agencyId_email: { agencyId, email } },
      create: {
        agencyId,
        email,
        role: role as "ADMIN" | "MEMBER",
        token: hashed,
        expiresAt,
        invitedById,
      },
      update: {
        role: role as "ADMIN" | "MEMBER",
        token: hashed,
        expiresAt,
        acceptedAt: null,
        invitedById,
      },
    });

    const inviteUrl = buildAcceptInviteUrl(raw, email);

    await sendEmail(
      email,
      `${session.user.name ?? "Your team"} invited you to ${agency.name}`,
      renderTeamInvitationEmail({
        agency: {
          name: agency.name,
          brandColor: session.user.agencyBrandColor,
        },
        inviterName: session.user.name ?? "Your team",
        role,
        inviteUrl,
      })
    );

    revalidatePath("/app/settings/team");
    return { invitationId: "invite-sent" };
  });
}

export async function revokeTeamInvitationAction(
  invitationId: string
): Promise<ActionResult<void>> {
  return createSafeAction(async () => {
    const session = await auth();
    if (!session?.user?.agencyId) throw new Error("Unauthorized");
    await requireAgencyAdmin(session.user.agencyId);

    if (isDevBypass()) return;

    const invite = await prisma.teamInvitation.findUniqueOrThrow({
      where: { id: invitationId },
    });
    if (invite.agencyId !== session.user.agencyId) throw new Error("Forbidden");

    await prisma.teamInvitation.delete({ where: { id: invitationId } });
    revalidatePath("/app/settings/team");
  });
}

export async function removeTeamMemberAction(
  userId: string
): Promise<ActionResult<void>> {
  return createSafeAction(async () => {
    const session = await auth();
    if (!session?.user?.agencyId) throw new Error("Unauthorized");
    await requireAgencyAdmin(session.user.agencyId);

    if (isDevBypass()) return;

    const member = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (member.agencyId !== session.user.agencyId) throw new Error("Forbidden");
    if (member.role === "OWNER") throw new Error("Cannot remove the agency owner.");
    if (member.id === session.user.id) throw new Error("You cannot remove yourself.");

    await prisma.user.update({
      where: { id: userId },
      data: { agencyId: null },
    });

    revalidatePath("/app/settings/team");
  });
}

export async function updateTeamMemberRoleAction(
  userId: string,
  role: "ADMIN" | "MEMBER"
): Promise<ActionResult<void>> {
  return createSafeAction(async () => {
    const session = await auth();
    if (!session?.user?.agencyId) throw new Error("Unauthorized");

    if (session.user.role !== "OWNER") throw new Error("Only the agency owner can change roles.");

    if (isDevBypass()) return;

    const member = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (member.agencyId !== session.user.agencyId) throw new Error("Forbidden");
    if (member.role === "OWNER") throw new Error("Cannot change the owner's role.");

    await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath("/app/settings/team");
  });
}
