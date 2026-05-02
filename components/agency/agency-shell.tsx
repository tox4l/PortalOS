"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Buildings,
  ChartLineUp,
  Plus,
  SquaresFour,
  GearSix,
  UsersThree,
  FileText,
  type Icon
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NotificationPanel } from "@/components/shared/notification-panel";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/actions/notifications";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/app/clients", label: "Clients", icon: Buildings },
  { href: "/app/projects", label: "Projects", icon: Briefcase },
  { href: "/app/invoices", label: "Invoices", icon: FileText },
  { href: "/app/settings", label: "Settings", icon: GearSix }
] satisfies Array<{ href: string; label: string; icon: Icon }>;

const pageTitles: Array<{ match: string; eyebrow: string; title: string }> = [
  { match: "/app/dashboard", eyebrow: "Client operations", title: "Good evening, Sarah" },
  { match: "/app/clients", eyebrow: "Relationships", title: "Clients" },
  { match: "/app/projects", eyebrow: "Production", title: "Projects" },
  { match: "/app/invoices", eyebrow: "Revenue", title: "Invoices" },
  { match: "/app/settings", eyebrow: "Workspace", title: "Settings" }
];

const commandSignals = [
  { label: "Review load", value: "05" },
  { label: "Reviews", value: "5" },
  { label: "Due", value: "14" }
];

type AgencyShellProps = {
  children: React.ReactNode;
  initialNotifications: NotificationItem[];
  notificationChannel: string;
};

export function AgencyShell({ children, initialNotifications, notificationChannel }: AgencyShellProps) {
  const pathname = usePathname();
  const scrolled = useScrollTop(20);
  const title = pageTitles.find((item) => pathname.startsWith(item.match)) ?? pageTitles[0];

  return (
    <TooltipProvider>
      <div className="min-h-[100dvh] bg-[var(--bg-void)] text-[var(--ink-primary)]">
        <div className="pointer-events-none fixed inset-0 opacity-[0.08]" aria-hidden="true" style={{
          backgroundImage: `linear-gradient(var(--border-hairline) 1px, transparent 1px), linear-gradient(90deg, var(--border-hairline) 1px, transparent 1px)`,
          backgroundPosition: '-1px -1px',
          backgroundSize: '48px 48px'
        }} />
        <div className="relative grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[232px_minmax(0,1fr)]">
          <aside className="hidden border-r border-[var(--border-hairline)] bg-[var(--bg-base)] lg:block">
            <div className="sticky top-0 flex h-[100dvh] flex-col px-4 py-5">
              <Link className="group inline-flex items-center gap-2.5 rounded-[7px] px-1 py-1" href="/app/dashboard">
                <span className="flex size-9 items-center justify-center rounded-[6px] border border-[var(--border-gold-dim)] bg-[var(--gold-dim)] text-[var(--gold-core)]">
                  <ChartLineUp aria-hidden="true" size={16} weight="duotone" />
                </span>
                <span className="font-display text-[1.375rem] font-normal tracking-[-0.01em] text-[var(--ink-primary)] transition-colors group-hover:text-[var(--gold-core)]">
                  PortalOS
                </span>
              </Link>
              <div className="mt-4 border-t border-[var(--border-hairline)]" />
              <div className="mt-4 surface-panel p-3.5">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Agency</p>
                <p className="mt-1.5 font-sans text-[0.9375rem] font-medium leading-tight text-[var(--ink-primary)]">Lumina Creative</p>
                <p className="mt-0.5 font-sans text-[0.75rem] leading-5 text-[var(--ink-secondary)]">Demo workspace</p>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--border-hairline)] pt-3">
                  {commandSignals.map((signal) => (
                    <div key={signal.label}>
                      <p className="font-display text-[0.8125rem] leading-none text-[var(--ink-primary)]">{signal.value}</p>
                      <p className="mt-1 font-sans text-[0.625rem] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">{signal.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <nav className="mt-6 space-y-0.5" aria-label="Agency navigation">
                {navItems.map((item) => (
                  <Link
                    className={cn(
                      "group relative flex min-h-10 items-center gap-2.5 rounded-[8px] px-3 font-sans text-[0.8125rem] font-medium text-[var(--ink-tertiary)] transition-[background-color,color] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--gold-wash)] hover:text-[var(--ink-secondary)]",
                      pathname.startsWith(item.href) &&
                        "bg-[var(--gold-dim)] text-[var(--gold-core)]"
                    )}
                    aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                    data-active={pathname.startsWith(item.href) ? "true" : undefined}
                    href={item.href}
                    key={item.href}
                  >
                    <item.icon
                      aria-hidden="true"
                      className={cn(
                        "size-4 text-[var(--ink-tertiary)] transition-colors",
                        pathname.startsWith(item.href) && "text-[var(--gold-core)]"
                      )}
                      weight={pathname.startsWith(item.href) ? "duotone" : "regular"}
                    />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto surface-panel p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] font-sans text-[0.75rem] font-medium text-[var(--ink-primary)]">
                    SK
                  </div>
                  <div>
                    <p className="font-sans text-[0.8125rem] font-medium text-[var(--ink-primary)]">Sarah Kim</p>
                    <p className="font-sans text-[0.625rem] uppercase tracking-[0.06em] text-[var(--ink-tertiary)]">Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
          <div className="min-w-0">
            <header
              className={cn(
                "sticky top-0 z-20 border-b px-4 py-4 md:px-8 transition-[background-color,border-color] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                scrolled
                  ? "border-[var(--border-hairline)] bg-[var(--bg-base)]"
                  : "border-transparent bg-transparent"
              )}
            >
              <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">{title.eyebrow}</p>
                  <h1 className="font-display text-[2rem] font-normal leading-tight text-[var(--ink-primary)]">
                    {title.title}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button asChild className="hidden md:inline-flex" size="sm" variant="secondary">
                    <Link href="/app/projects/new">
                      <Plus aria-hidden="true" className="size-4" />
                      New project
                    </Link>
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button aria-label="Team" size="icon" variant="ghost">
                        <UsersThree aria-hidden="true" className="size-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Team</TooltipContent>
                  </Tooltip>
                  <NotificationPanel
                    channelName={notificationChannel}
                    initialNotifications={initialNotifications}
                    target="agency"
                  />
                </div>
              </div>
            </header>
            <nav className="flex gap-2 overflow-x-auto border-b border-[var(--border-hairline)] bg-[var(--bg-base)] px-4 py-2 lg:hidden" aria-label="Mobile agency navigation">
              {navItems.map((item) => (
                <Link
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-[5px] border border-transparent px-3 font-sans text-[0.8125rem] font-medium text-[var(--ink-tertiary)]",
                    pathname.startsWith(item.href) &&
                      "border-[var(--border-gold-dim)] bg-[var(--gold-dim)] text-[var(--gold-core)]"
                  )}
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                  href={item.href}
                  key={item.href}
                >
                  <item.icon aria-hidden="true" className="size-4" weight={pathname.startsWith(item.href) ? "duotone" : "regular"} />
                  {item.label}
                </Link>
              ))}
            </nav>
            <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-8 md:py-12">{children}</main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
