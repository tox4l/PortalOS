"use client";

import { useActionState, useState } from "react";
import {
  DotsThree,
  EnvelopeSimple,
  Prohibit,
  ShieldCheck,
  Trash,
  UserPlus,
  Users,
  X,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeamMember, PendingInvitation } from "@/actions/team";
import {
  inviteTeamMemberAction,
  revokeTeamInvitationAction,
  removeTeamMemberAction,
  updateTeamMemberRoleAction,
} from "@/actions/team";

type Props = {
  members: TeamMember[];
  invitations: PendingInvitation[];
  plan: string;
  teamSeatsUsed: number;
  teamSeatsMax: number;
  canInvite: boolean;
  currentUserId: string;
  currentUserRole: string;
};

const roleBadgeVariant: Record<string, "active" | "review" | "draft" | undefined> = {
  OWNER: "active",
  ADMIN: "review",
  MEMBER: "draft",
};

const roleLabel: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

function getInitials(name: string | null): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function TeamSettingsClient({
  members,
  invitations,
  plan,
  teamSeatsUsed,
  teamSeatsMax,
  canInvite,
  currentUserId,
  currentUserRole,
}: Props) {
  const [inviteState, inviteDispatch] = useActionState(inviteTeamMemberAction, { success: false });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isOwner = currentUserRole === "OWNER";
  const isAdmin = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
  const seatPercent = Math.round((teamSeatsUsed / teamSeatsMax) * 100);

  return (
    <div className="space-y-8">
      {/* Seat indicator */}
      <Card>
        <CardHeader>
          <CardTitle>Plan seats</CardTitle>
          <CardDescription>
            {plan === "GROWTH" ? "Growth" : "Studio"} plan &middot;{" "}
            {teamSeatsUsed} of {teamSeatsMax} seats used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[0.8125rem]">
              <span className="text-[var(--ink-secondary)]">Team members</span>
              <span className="font-mono tabular-nums text-[var(--ink-primary)]">
                {teamSeatsUsed}/{teamSeatsMax}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-sunken)]">
              <div
                className="h-full rounded-full bg-[var(--gold-core)] transition-[width] duration-[var(--t-slow)] ease-[var(--ease-out)]"
                style={{ width: `${Math.min(seatPercent, 100)}%` }}
              />
            </div>
            {!canInvite && (
              <p className="text-[0.75rem] leading-5 text-[var(--ink-tertiary)]">
                Seat limit reached. Upgrade to Growth to add more team members.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invite form */}
      {canInvite && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Invite a team member</CardTitle>
            <CardDescription>
              Send an invitation via email. They will receive a link to set up their account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={inviteDispatch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="invite-email">Email address</Label>
                <Input
                  id="invite-email"
                  name="email"
                  placeholder="colleague@agency.com"
                  type="email"
                  required
                />
              </div>
              <div className="w-40 space-y-1.5">
                <Label htmlFor="invite-role">Role</Label>
                <Select
                  defaultValue="MEMBER"
                  id="invite-role"
                  name="role"
                  options={[
                    { value: "MEMBER", label: "Member" },
                    { value: "ADMIN", label: "Admin" },
                  ]}
                />
              </div>
              <Button type="submit">
                <EnvelopeSimple aria-hidden="true" className="size-4" />
                Send invitation
              </Button>
            </form>
            {inviteState.error && (
              <p className="mt-3 text-[0.8125rem] leading-5 text-[var(--danger-text)]">{inviteState.error}</p>
            )}
            {inviteState.success && !inviteState.error && (
              <p className="mt-3 text-[0.8125rem] leading-5 text-[var(--success-text)]">
                Invitation sent successfully.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending invitations */}
      {invitations.length > 0 && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>
              {invitations.length} invitation{invitations.length !== 1 ? "s" : ""} awaiting acceptance.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-[var(--border-hairline)] p-0">
            {invitations.map((inv) => (
              <div className="flex items-center justify-between gap-4 px-6 py-4" key={inv.id}>
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-elevated)] text-[0.8125rem] font-sans font-medium text-[var(--ink-tertiary)]">
                    <EnvelopeSimple aria-hidden="true" className="size-4" />
                  </div>
                  <div>
                    <p className="font-sans font-medium text-[0.875rem] text-[var(--ink-primary)]">{inv.email}</p>
                    <p className="text-[0.8125rem] text-[var(--ink-secondary)]">
                      {roleLabel[inv.role] ?? inv.role} &middot; Invited by {inv.invitedByName ?? "Unknown"} &middot;{" "}
                      Expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  aria-label={`Revoke invitation for ${inv.email}`}
                  onClick={async () => {
                    await revokeTeamInvitationAction(inv.id);
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current team */}
      <Card>
        <CardHeader>
          <CardTitle>Current team</CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? "s" : ""} in your agency.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-[var(--border-hairline)] p-0">
          {members.map((member) => {
            const isSelf = member.id === currentUserId;
            const isMemberOwner = member.role === "OWNER";
            const canManage =
              isAdmin && !isSelf && !isMemberOwner && (isOwner || member.role !== "ADMIN");
            const isMenuOpen = openMenuId === member.id;
            const isRemoving = removingId === member.id;

            return (
              <div className="flex items-center justify-between gap-4 px-6 py-4" key={member.id}>
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-elevated)] text-[0.8125rem] font-sans font-medium text-[var(--ink-primary)]">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-sans font-medium text-[0.875rem] text-[var(--ink-primary)]">
                        {member.name ?? "Unnamed"}
                        {isSelf && (
                          <span className="ml-1.5 text-[0.6875rem] font-normal text-[var(--ink-tertiary)]">
                            (you)
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-[0.8125rem] text-[var(--ink-secondary)]">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck aria-hidden="true" className="size-4 text-[var(--ink-tertiary)]" />
                    <Badge variant={roleBadgeVariant[member.role] ?? "draft"}>
                      {roleLabel[member.role] ?? member.role}
                    </Badge>
                  </div>

                  {canManage && (
                    <div className="relative">
                      <Button
                        aria-label={`More actions for ${member.name}`}
                        onClick={() => setOpenMenuId(isMenuOpen ? null : member.id)}
                        size="icon"
                        variant="ghost"
                      >
                        <DotsThree aria-hidden="true" className="size-4" weight="bold" />
                      </Button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)] p-1">
                            {isOwner && member.role === "MEMBER" && (
                              <button
                                className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-[0.8125rem] text-[var(--ink-primary)] hover:bg-[var(--neutral-bg)] transition-colors duration-[var(--t-base)]"
                                onClick={async () => {
                                  await updateTeamMemberRoleAction(member.id, "ADMIN");
                                  setOpenMenuId(null);
                                }}
                                type="button"
                              >
                                <ShieldCheck aria-hidden="true" className="size-4" />
                                Promote to Admin
                              </button>
                            )}
                            {isOwner && member.role === "ADMIN" && (
                              <button
                                className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-[0.8125rem] text-[var(--ink-primary)] hover:bg-[var(--neutral-bg)] transition-colors duration-[var(--t-base)]"
                                onClick={async () => {
                                  await updateTeamMemberRoleAction(member.id, "MEMBER");
                                  setOpenMenuId(null);
                                }}
                                type="button"
                              >
                                <ShieldCheck aria-hidden="true" className="size-4" />
                                Demote to Member
                              </button>
                            )}
                            <button
                              className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-[0.8125rem] text-[var(--danger-text)] hover:bg-[var(--danger-bg)] transition-colors duration-[var(--t-base)]"
                              onClick={async () => {
                                setRemovingId(member.id);
                                setOpenMenuId(null);
                              }}
                              type="button"
                            >
                              <Trash aria-hidden="true" className="size-4" />
                              Remove from team
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Remove confirmation */}
                {isRemoving && (
                  <div className="fixed inset-0 z-30 flex items-center justify-center bg-[var(--bg-overlay)]">
                    <div className="w-full max-w-[400px] surface-panel bg-[var(--bg-elevated)] border-[var(--border-subtle)] p-6 shadow-[var(--shadow-lg)]">
                      <h3 className="font-display text-[1.25rem] font-normal leading-tight text-[var(--ink-primary)]">
                        Remove team member
                      </h3>
                      <p className="mt-2 text-[0.875rem] leading-6 text-[var(--ink-secondary)]">
                        Are you sure you want to remove{" "}
                        <strong className="font-sans font-medium text-[var(--ink-primary)]">{member.name ?? member.email}</strong> from
                        the team? They will lose access to all agency projects.
                      </p>
                      <div className="mt-6 flex justify-end gap-3">
                        <Button
                          onClick={() => setRemovingId(null)}
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={async () => {
                            await removeTeamMemberAction(member.id);
                            setRemovingId(null);
                          }}
                          variant="secondary"
                        >
                          <Prohibit aria-hidden="true" className="size-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
