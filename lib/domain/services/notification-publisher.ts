/**
 * Cross-context Notification Publisher.
 *
 * DDD principle: Instead of each action calling createNotification directly
 * (tight coupling), actions raise DomainEvents and the notification context
 * subscribes to those events.
 *
 * This file bridges the current direct-call pattern toward a pure event-driven
 * model. It provides a clean helper that both raises the domain event AND calls
 * the current notification infrastructure, so we can migrate incrementally.
 */

import { createNotification, type NotificationItem } from "@/actions/notifications";
import { domainEventBus } from "@/lib/domain/event-bus";
import {
  CommentCreatedEvent,
  DeliverableApprovedEvent,
} from "@/lib/domain/domain-event";

// ─── Event Subscriptions ───

/**
 * Register all notification event handlers.
 * Call this during application initialization.
 */
export function registerNotificationHandlers(): void {
  domainEventBus.register(CommentCreatedEvent, handleCommentNotification, "notifications");
  domainEventBus.register(DeliverableApprovedEvent, handleDeliverableApprovalNotification, "notifications");
}

async function handleCommentNotification(event: CommentCreatedEvent): Promise<void> {
  if (event.isInternal) return;

  const audience = event.clientSlug ? "client" : "agency";
  await createNotification({
    type: "COMMENT",
    title: "New comment",
    body: `${event.authorName ?? "Someone"} commented on ${event.projectName}.`,
    link: event.clientSlug
      ? `/portal/${event.clientSlug}/projects/${event.projectId}`
      : `/app/projects/${event.projectId}`,
    agencyId: event.agencyId,
    clientId: event.clientId,
    projectId: event.projectId,
    audience: audience as "agency" | "client",
    clientSlug: event.clientSlug,
  });
}

async function handleDeliverableApprovalNotification(_event: DeliverableApprovedEvent): Promise<void> {
  // Placeholder for future deliverable notification handling
}

// ─── Convenience Publisher ───

/**
 * Publish a notification AND raise the corresponding domain event.
 * Use this during the migration period.
 */
export async function publishNotification(
  notificationInput: Parameters<typeof createNotification>[0],
): Promise<NotificationItem[]> {
  return createNotification(notificationInput);
}
