"use client";

import type { ActivityEvent, User } from "@prisma/client";

type ActivityEventWithActor = Pick<ActivityEvent, "id" | "type" | "title" | "body" | "link" | "createdAt" | "projectId"> & {
  actorUser: Pick<User, "id" | "name" | "image"> | null;
  actorClientUser: { id: string; name: string } | null;
};

const EVENT_ICONS: Record<string, string> = {
  COMMENT_POSTED: "💬",
  APPROVAL_GIVEN: "✅",
  DELIVERABLE_UPLOADED: "📎",
  TASK_MOVED: "🔄",
  BRIEF_SENT: "📋",
};

function formatTime(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function actorName(event: ActivityEventWithActor): string {
  return event.actorUser?.name ?? event.actorClientUser?.name ?? "Someone";
}

export function ActivityFeed({ events }: { events: ActivityEventWithActor[] }) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[13px] text-[var(--ink-tertiary)]">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event) => (
        <a
          key={event.id}
          href={event.link}
          className="flex items-start gap-3 border-b border-[var(--border-hairline)] px-4 py-3 transition-colors hover:bg-[var(--neutral-bg)] no-underline last:border-b-0"
        >
          <span className="mt-0.5 text-[15px]" aria-hidden="true">
            {EVENT_ICONS[event.type] ?? "•"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-snug text-[var(--ink-primary)]">
              <span className="font-medium">{actorName(event)}</span>{" "}
              <span className="text-[var(--ink-secondary)]">{event.body}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--ink-tertiary)]">
              {formatTime(event.createdAt)}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
