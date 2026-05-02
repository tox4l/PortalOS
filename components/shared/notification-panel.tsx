"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  X
} from "@phosphor-icons/react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationItem
} from "@/actions/notifications";
import { useAblyChannel } from "@/hooks/use-ably";
import { cn } from "@/lib/utils";

type NotificationPanelProps = {
  channelName: string;
  initialNotifications: NotificationItem[];
  target: "agency" | "client";
  clientSlug?: string;
};

function formatNotificationTime(value: string): string {
  const created = new Date(value).getTime();
  const diff = Date.now() - created;
  const minutes = Math.max(1, Math.floor(diff / 60_000));

  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getActorInitials(title: string): string {
  const words = title.split(" ");
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return title.slice(0, 2).toUpperCase();
}

export function NotificationPanel({
  channelName,
  clientSlug,
  initialNotifications,
  target
}: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  useAblyChannel(channelName, "notification.created", (message) => {
    const notification = message.data as NotificationItem;
    if (!notification?.id) return;

    setNotifications((current) => {
      if (current.some((item) => item.id === notification.id)) return current;
      return [notification, ...current].slice(0, 30);
    });
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  function markRead(notificationId: string) {
    setNotifications((current) =>
      current.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    startTransition(() => {
      void markNotificationReadAction({ notificationId });
    });
  }

  function markAllRead() {
    setNotifications((current) =>
      current.map((n) => ({ ...n, read: true }))
    );
    startTransition(() => {
      void markAllNotificationsReadAction(target, clientSlug);
    });
  }

  return (
    <>
      <button
        aria-label="Notifications"
        className="relative inline-flex size-9 items-center justify-center rounded-[4px] text-[var(--ink-tertiary)] transition-colors hover:bg-[var(--neutral-bg)] hover:text-[var(--ink-primary)]"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Bell aria-hidden="true" className="size-5" weight="regular" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-[4px] bg-[var(--gold-core)] px-1.5 py-0.5 font-sans text-[10px] font-medium leading-none text-[var(--bg-void)]">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close notifications"
            className="absolute inset-0 bg-[var(--bg-overlay)]"
            onClick={() => setOpen(false)}
            type="button"
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[380px] animate-[notification-slide_250ms_var(--ease-out)] flex-col border-l border-[var(--border-hairline)] bg-[var(--bg-base)] md:max-w-[380px]">
            {/* Header */}
            <header className="shrink-0 border-b border-[var(--border-hairline)] px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-[28px] font-normal leading-tight">
                    Notifications
                  </h2>
                  <p className="mt-1 font-eyebrow text-[var(--ink-tertiary)]">
                    {unreadCount} unread
                  </p>
                </div>
                <button
                  aria-label="Close"
                  className="inline-flex size-8 items-center justify-center rounded-[4px] text-[var(--ink-tertiary)] transition-colors hover:bg-[var(--neutral-bg)] hover:text-[var(--ink-primary)]"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X aria-hidden="true" className="size-4" weight="bold" />
                </button>
              </div>
            </header>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {notifications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-display text-[20px] font-normal leading-relaxed text-[var(--ink-tertiary)]">
                    No notifications.
                  </p>
                  <p className="mt-1 font-sans text-[0.875rem] leading-relaxed text-[var(--ink-tertiary)]">
                    The room is quiet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-hairline)]">
                  {notifications.map((notification) => {
                    return (
                      <Link
                        className={cn(
                          "flex gap-3 py-4 transition-colors",
                          !notification.read && "bg-[var(--gold-dim)] -mx-5 px-5"
                        )}
                        href={notification.link}
                        key={notification.id}
                        onClick={() => {
                          markRead(notification.id);
                          setOpen(false);
                        }}
                      >
                        {/* Gold-tinted avatar */}
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-[4px] bg-[var(--gold-dim)] text-[var(--gold-core)]">
                          <span className="font-mono text-[11px] tabular-nums">
                            {getActorInitials(notification.title)}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[14px] font-medium">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="size-1.5 shrink-0 rounded-full bg-[var(--gold-core)]" />
                            )}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[14px] leading-5 text-[var(--ink-tertiary)]">
                            {notification.body}
                          </p>
                          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <footer className="shrink-0 border-t border-[var(--border-hairline)] px-5 py-4">
                <button
                  className="w-full py-2 text-center font-eyebrow text-[var(--gold-core)] transition-colors hover:text-[var(--gold-mid)] disabled:opacity-30"
                  disabled={isPending || unreadCount === 0}
                  onClick={markAllRead}
                  type="button"
                >
                  Mark all read
                </button>
              </footer>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
