/**
 * Domain errors for PortalOS DDD architecture.
 *
 * Typed errors ensure that application-layer code can distinguish
 * domain violations from infrastructure failures.
 */

export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// ─── Agency Context Errors ───

export class AgencyNotFoundError extends DomainError {
  constructor(agencyId: string) {
    super(`Agency not found: ${agencyId}`, "AGENCY_NOT_FOUND");
  }
}

export class InsufficientTeamSeatsError extends DomainError {
  constructor(plan: string, max: number) {
    super(
      `Your ${plan} plan allows up to ${max} team members. Upgrade to add more.`,
      "INSUFFICIENT_TEAM_SEATS",
    );
  }
}

export class TeamMemberAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`A team member with email ${email} already exists.`, "TEAM_MEMBER_EXISTS");
  }
}

export class CannotRemoveOwnerError extends DomainError {
  constructor() {
    super("Cannot remove the agency owner.", "CANNOT_REMOVE_OWNER");
  }
}

// ─── Client Context Errors ───

export class ClientNotFoundError extends DomainError {
  constructor(clientId?: string) {
    super(`Client not found${clientId ? `: ${clientId}` : ""}.`, "CLIENT_NOT_FOUND");
  }
}

export class PortalSlugConflictError extends DomainError {
  constructor(slug: string) {
    super(`The portal URL "${slug}" is already taken.`, "SLUG_CONFLICT");
  }

  static agencyOwnSlug(agencySlug: string): PortalSlugConflictError {
    return new PortalSlugConflictError(
      `This portal URL conflicts with your agency subdomain (${agencySlug}). On the Growth plan, agency slugs cannot be reused as client portal slugs.`,
    );
  }
}

export class InsufficientClientSeatsError extends DomainError {
  constructor(plan: string, max: number) {
    super(
      `Your ${plan} plan allows up to ${max} active clients. Upgrade to add more.`,
      "INSUFFICIENT_CLIENT_SEATS",
    );
  }
}

// ─── Project Context Errors ───

export class ProjectNotFoundError extends DomainError {
  constructor(projectId: string) {
    super(`Project not found: ${projectId}`, "PROJECT_NOT_FOUND");
  }
}

export class TaskNotFoundError extends DomainError {
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`, "TASK_NOT_FOUND");
  }
}

export class DeliverableNotFoundError extends DomainError {
  constructor(deliverableId: string) {
    super(`Deliverable not found: ${deliverableId}`, "DELIVERABLE_NOT_FOUND");
  }
}

// ─── Invitation Errors ───

export class InviteAlreadySentError extends DomainError {
  constructor(email: string) {
    super(`An invitation has already been sent to ${email}.`, "INVITE_ALREADY_SENT");
  }
}

export class InviteExpiredError extends DomainError {
  constructor() {
    super("This invitation has expired.", "INVITE_EXPIRED");
  }
}

// ─── Storage Errors ───

export class StorageQuotaExceededError extends DomainError {
  constructor() {
    super("Storage quota exceeded.", "STORAGE_QUOTA_EXCEEDED");
  }
}
