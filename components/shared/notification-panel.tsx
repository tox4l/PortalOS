"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  ChatCircleText,
  FileArrowUp,
  X
} from "@phosphor-icons/react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationItem
} from "@/actions/notifications";
import { useAblyChannel } from "@/hooks/use-ably";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationPanelProps = {
  channelName: string;
  initialNotifications: NotificationItem[];
  target: "agency" | "client";
  clientSlug?: string;
};

const iconMap = {
  COMMENT: ChatCircleText,
  APPROVAL: CheckCircle,
  MENTION: ChatCircleText,
  TASK_ASSIGNED: CheckCircle,
  DELIVERABLE_UPLOADED: FileArrowUp
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
    if (!notification?.id) {
      return;
    }

    setNotifications((current) => {
      if (current.some((item) => item.id === notification.id)) {
        return current;
      }

      return [notification, ...current].slice(0, 30);
    });
  });

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  function markRead(notificationId: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );

    startTransition(() => {
      void markNotificationReadAction({ notificationId });
    });
  }

  function markAllRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );

    startTransition(() => {
      void markAllNotificationsReadAction(target, clientSlug);
    });
  }

  return (
    <>
      <button
        aria-label="Notifications"
        className="relative inline-flex size-9 items-center justify-center rounded-[8px] text-[var(--ink-tertiary)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--ink-secondary)]"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Bell aria-hidden="true" className="size-5" weight="regular" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-[6px] bg-[var(--gold-core)] px-1.5 py-0.5 font-mono text-[10px] leading-none text-[#0A0A0B] shadow-[var(--glow-gold-sm)]">
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
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[380px] animate-[notification-slide_250ms_var(--ease-out)] flex-col border-l border-[var(--border-hairline)] bg-[var(--bg-elevated)] shadow-[var(--shadow-xl)]">
            <header className="border-b border-[var(--border-default)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
                    Notifications
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--ink-tertiary)]">
                    {unreadCount} unread
                  </p>
                </div>
                <button
                  aria-label="Close"
                  className="inline-flex size-8 items-center justify-center rounded-[8px] text-[var(--ink-tertiary)] transition-colors hover:bg-[var(--neutral-bg)] hover:text-[var(--ink-primary)]"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X aria-hidden="true" className="size-4" weight="bold" />
                </button>
              </div>
              <Button
                className="mt-4 w-full"
                disabled={isPending || unreadCount === 0}
                onClick={markAllRead}
                size="sm"
                variant="secondary"
              >
                Mark all read
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto p-3">
              {notifications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
                    <Bell aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" />
                  </div>
                  <p className="mt-4 text-[14px] font-medium text-[var(--ink-primary)]">
                    Nothing needs attention
                  </p>
                  <p className="mt-1 max-w-[240px] text-[13px] leading-6 text-[var(--ink-tertiary)]">
                    Client comments, approval changes, and file updates will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const Icon = iconMap[notification.type] ?? Bell;

                    return (
                      <Link
                        className={cn(
                          "block rounded-[10px] border p-4 transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5",
                          notification.read
                            ? "border-[var(--border-default)] bg-[var(--bg-surface)]"
                            : "border-[var(--border-gold-dim)] bg-[var(--gold-dim)] shadow-[var(--inset-gold)]"
                        )}
                        href={notification.link}
                        key={notification.id}
                        onClick={() => {
                          markRead(notification.id);
                          setOpen(false);
                        }}
                      >
                        <div className="flex gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--bg-sunken)] text-[var(--gold-core)]">
                            <Icon aria-hidden="true" className="size-4" weight="duotone" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-[14px] font-medium text-[var(--ink-primary)]">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="size-1.5 shrink-0 rounded-full bg-[var(--gold-core)]" />
                              )}
                            </div>
                            <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[var(--ink-secondary)]">
                              {notification.body}
                            </p>
                            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
