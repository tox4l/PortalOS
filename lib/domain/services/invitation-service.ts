/**
 * Shared Invitation Service for PortalOS DDD architecture.
 *
 * Eliminates duplicated invitation logic across Agency and Client contexts.
 * Both inviteTeamMemberAction and inviteClientTeammateAction use this service.
 *
 * DDD principle: Extracting shared domain logic into a domain service
 * reduces duplication and ensures consistent behavior.
 */

import { prisma } from "@/lib/db";
import { generateInviteToken, inviteExpiresAt } from "@/lib/invite-tokens";
import { sanitizeEmail } from "@/lib/sanitize";
import { InviteAlreadySentError } from "@/lib/domain/errors";

export type InvitationMetadata = {
  email: string;
  role: string;
  invitedById: string;
  expiresAt: Date;
  tokenHashed: string;
};

export type InviteeCheckResult =
  | { status: "exists" }
  | { status: "duplicate_invite" }
  | { status: "ok" };

/**
 * Check if an email already has a user or pending invitation in a scope.
 * Used by both Agency TeamMember and ClientTeammate invitation flows.
 */
export async function checkInviteeAvailability(
  targetModel: "teamInvitation" | "clientInvitation",
  scopeField: string,
  scopeValue: string,
  email: string,
): Promise<InviteeCheckResult> {
  const sanitized = sanitizeEmail(email);
  if (!sanitized) throw new Error("Valid email is required.");

  // Check existing user depends on the invitation type
  if (targetModel === "teamInvitation") {
    const existingUser = await prisma.user.findFirst({
      where: { email: sanitized, agencyId: scopeValue },
      select: { id: true },
    });
    if (existingUser) return { status: "exists" };
  }

  // Check existing pending invitation
  const inviteWhere =
    targetModel === "teamInvitation"
      ? { agencyId_email: { agencyId: scopeValue, email: sanitized } }
      : { clientId_email: { clientId: scopeValue, email: sanitized } };

  const existingInvite =
    targetModel === "teamInvitation"
      ? await prisma.teamInvitation.findUnique({ where: inviteWhere as never })
      : await prisma.clientInvitation.findUnique({ where: inviteWhere as never });

  if (
    existingInvite &&
    existingInvite.expiresAt > new Date() &&
    !existingInvite.acceptedAt
  ) {
    return { status: "duplicate_invite" };
  }

  return { status: "ok" };
}

/**
 * Generate invitation token, hash, and expiry.
 */
export async function prepareInvitation(): Promise<{
  raw: string;
  hashed: string;
  expiresAt: Date;
}> {
  const { raw, hashed } = await generateInviteToken();
  const expiresAt = inviteExpiresAt();
  return { raw, hashed, expiresAt };
}

/**
 * Validate email format through Zod.
 */
export function validateInviteEmail(email: string): string {
  const sanitized = sanitizeEmail(email);
  if (!sanitized) throw new Error("Valid email is required.");
  return sanitized;
}
