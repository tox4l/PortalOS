/**
 * Domain Event base class for PortalOS DDD architecture.
 *
 * Enables cross-context communication without direct coupling.
 * Aggregate roots raise events; the event bus dispatches to handlers.
 */
export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly occurredOn: Date;
  public readonly eventVersion: number;

  constructor(aggregateId: string) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = aggregateId;
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }
}

// ─── PortalOS Domain Events ───

export class ClientCreatedEvent extends DomainEvent {
  constructor(
    clientId: string,
    public readonly agencyId: string,
    public readonly companyName: string,
    public readonly contactEmail: string,
    public readonly portalSlug: string,
  ) {
    super(clientId);
  }
}

export class ClientInvitedEvent extends DomainEvent {
  constructor(
    invitationId: string,
    public readonly clientId: string,
    public readonly agencyId: string,
    public readonly email: string,
    public readonly role: string,
  ) {
    super(invitationId);
  }
}

export class ProjectCreatedEvent extends DomainEvent {
  constructor(
    projectId: string,
    public readonly agencyId: string,
    public readonly clientId: string,
    public readonly name: string,
    public readonly createdById: string,
  ) {
    super(projectId);
  }
}

export class TaskCreatedEvent extends DomainEvent {
  constructor(
    taskId: string,
    public readonly projectId: string,
    public readonly title: string,
    public readonly assigneeId: string | null,
  ) {
    super(taskId);
  }
}

export class TaskStatusChangedEvent extends DomainEvent {
  constructor(
    taskId: string,
    public readonly projectId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
  ) {
    super(taskId);
  }
}

export class DeliverableCreatedEvent extends DomainEvent {
  constructor(
    deliverableId: string,
    public readonly projectId: string,
    public readonly title: string,
  ) {
    super(deliverableId);
  }
}

export class DeliverableApprovedEvent extends DomainEvent {
  constructor(
    deliverableId: string,
    public readonly projectId: string,
    public readonly approvedByClientUserId: string,
  ) {
    super(deliverableId);
  }
}

export class CommentCreatedEvent extends DomainEvent {
  constructor(
    commentId: string,
    public readonly projectId: string,
    public readonly projectName: string,
    public readonly agencyId: string,
    public readonly clientId: string | null,
    public readonly clientSlug: string | null,
    public readonly isInternal: boolean,
    public readonly authorName: string | null,
  ) {
    super(commentId);
  }
}

export class TeamMemberInvitedEvent extends DomainEvent {
  constructor(
    invitationId: string,
    public readonly agencyId: string,
    public readonly email: string,
    public readonly role: string,
    public readonly invitedByName: string,
  ) {
    super(invitationId);
  }
}
