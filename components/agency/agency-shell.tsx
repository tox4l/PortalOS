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
  const title = pageTitles.find((item) => pathname.startsWith(item.match)) ?? pageTitles[0];

  return (
    <TooltipProvider>
      <div className="min-h-[100dvh] bg-[var(--bg-void)] text-[var(--ink-primary)]">
        <div className="pointer-events-none fixed inset-0 lux-grid opacity-[0.16]" aria-hidden="true" />
        <div className="relative grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden border-r border-[var(--border-default)] bg-[var(--bg-base)] lg:block">
            <div className="sticky top-0 flex h-[100dvh] flex-col px-4 py-5">
              <Link className="group inline-flex items-center gap-3 rounded-[10px] px-1 py-1" href="/app/dashboard">
                <span className="flex size-10 items-center justify-center rounded-[8px] border border-[var(--border-gold-dim)] bg-[var(--gold-dim)] text-[var(--gold-core)] shadow-[var(--inset-gold)]">
                  <ChartLineUp aria-hidden="true" size={17} weight="duotone" />
                </span>
                <span className="font-display text-2xl font-normal tracking-[-0.01em] text-[var(--ink-primary)] transition-colors group-hover:text-[var(--gold-core)]">
                  PortalOS
                </span>
              </Link>
              <div className="mt-5 lux-divider" />
              <div className="mt-5 lux-panel bg-[var(--bg-surface)] p-4">
                <p className="lux-meta">
                  Agency
                </p>
                <p className="mt-2 font-display text-xl font-medium leading-tight text-[var(--ink-primary)]">Lumina Creative</p>
                <p className="mt-1 text-[13px] leading-5 text-[var(--ink-secondary)]">
                  Demo workspace
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--border-default)] pt-4">
                  {commandSignals.map((signal) => (
                    <div key={signal.label}>
                      <p className="font-mono text-[13px] leading-none text-[var(--ink-primary)]">{signal.value}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">{signal.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <nav className="mt-8 space-y-1" aria-label="Agency navigation">
                {navItems.map((item) => (
                  <Link
                    className={cn(
                      "group relative flex min-h-11 items-center gap-3 rounded-[8px] px-3 text-[14px] font-medium text-[var(--ink-tertiary)] transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--ink-secondary)]",
                      pathname.startsWith(item.href) &&
                        "translate-x-0.5 bg-[var(--gold-dim)] text-[var(--gold-core)] shadow-[var(--inset-gold)]"
                    )}
                    aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                    data-active={pathname.startsWith(item.href) ? "true" : undefined}
                    href={item.href}
                    key={item.href}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-0 w-px -translate-y-1/2 bg-[var(--gold-core)] transition-[height] duration-200",
                        pathname.startsWith(item.href) && "h-6"
                      )}
                    />
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
              <div className="mt-auto lux-panel p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[13px] font-medium text-[var(--ink-primary)]">
                    SK
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[var(--ink-primary)]">Sarah Kim</p>
                    <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--ink-tertiary)]">Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
          <div className="min-w-0">
            <header className="sticky top-0 z-20 border-b border-[var(--border-default)] bg-[rgba(10,10,11,0.86)] px-4 py-4 backdrop-blur-xl md:px-8">
              <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="lux-meta">
                    {title.eyebrow}
                  </p>
                  <h1 className="font-display text-3xl font-normal leading-tight text-[var(--ink-primary)]">
                    {title.title}
                  </h1>
                  <div className="mt-2 hidden items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)] md:flex">
                    <span className="h-px w-8 bg-[var(--gold-muted)]" />
                    <span>Showroom data live</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
            <nav className="flex gap-2 overflow-x-auto border-b border-[var(--border-default)] bg-[var(--bg-base)] px-4 py-2 lg:hidden" aria-label="Mobile agency navigation">
              {navItems.map((item) => (
                <Link
                  className={cn(
                    "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[8px] border border-transparent px-3 text-[13px] font-medium text-[var(--ink-tertiary)]",
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
