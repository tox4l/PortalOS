"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Buildings, Rows, SignOut, type Icon } from "@phosphor-icons/react";
import { NotificationPanel } from "@/components/shared/notification-panel";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/actions/notifications";

type PortalNavItem = {
  href: string;
  label: string;
  icon: Icon;
};

type PortalShellProps = {
  agencyName: string;
  agencyBrandColor: string;
  clientName: string;
  initialNotifications: NotificationItem[];
  notificationChannel: string;
  portalSlug: string;
  children: React.ReactNode;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function rgbaFromHex(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return `rgba(140, 115, 64, ${alpha})`;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function PortalShell({
  agencyName,
  agencyBrandColor,
  clientName,
  initialNotifications,
  notificationChannel,
  portalSlug,
  children
}: PortalShellProps) {
  const pathname = usePathname();
  const scrolled = useScrollTop(20);
  const brandColor = /^#[0-9a-fA-F]{6}$/.test(agencyBrandColor) ? agencyBrandColor : "#D4AF37";
  const brandVars = {
    "--brand": brandColor,
    "--gold-core": brandColor,
    "--gold-mid": brandColor,
    "--gold-400": brandColor,
    "--gold-500": brandColor,
    "--border-gold": rgbaFromHex(brandColor, 0.45),
    "--border-gold-dim": rgbaFromHex(brandColor, 0.20),
    "--border-gold-hot": rgbaFromHex(brandColor, 0.75),
    "--gold-dim": rgbaFromHex(brandColor, 0.06),
    "--gold-glow": rgbaFromHex(brandColor, 0.12),
    "--gold-100": rgbaFromHex(brandColor, 0.06),
    "--gold-200": rgbaFromHex(brandColor, 0.12)
  } as React.CSSProperties;

  const navItems: PortalNavItem[] = [
    { href: `/portal/${portalSlug}`, label: "Projects", icon: Briefcase },
    { href: `/portal/${portalSlug}/activity`, label: "Activity", icon: Rows }
  ];

  return (
    <div
      className="min-h-[100dvh] bg-[var(--bg-void)] text-[var(--ink-primary)]"
      style={brandVars}
    >
      <div className="pointer-events-none fixed inset-0 opacity-[0.04]" aria-hidden="true" style={{
        backgroundImage: `linear-gradient(var(--border-hairline) 1px, transparent 1px), linear-gradient(90deg, var(--border-hairline) 1px, transparent 1px)`,
        backgroundPosition: '-1px -1px',
        backgroundSize: '48px 48px'
      }} />
      <header
        className={cn(
          "sticky top-0 z-20 border-b transition-[background-color,backdrop-filter,border-color] duration-[280ms] ease-[var(--ease-out)]",
          scrolled
            ? "border-[var(--border-hairline)] bg-[var(--bg-base)]/90"
            : "border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-5 md:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              className="group inline-flex min-w-0 items-center gap-3"
              href={`/portal/${portalSlug}`}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)] font-display text-[20px] text-[var(--gold-core)] shadow-[var(--inset-gold)]">
                {agencyName.charAt(0)}
              </span>
              <span className="truncate font-display text-[26px] font-normal tracking-[-0.02em] text-[var(--ink-primary)] transition-colors duration-[180ms] ease-[var(--ease-out)] group-hover:text-[var(--gold-core)]">
                {agencyName}
              </span>
            </Link>
            <span className="hidden h-5 w-px bg-[var(--border-medium)] sm:block" aria-hidden="true" />
            <span className="hidden min-w-0 items-center gap-2 text-[13px] font-medium text-[var(--ink-secondary)] sm:inline-flex">
              <Buildings aria-hidden="true" className="size-4 shrink-0 text-[var(--ink-tertiary)]" weight="duotone" />
              <span className="truncate">{clientName}</span>
            </span>
          </div>

          <nav className="flex items-center gap-1" aria-label="Portal navigation">
            <ThemeToggle />
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/projects`);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-[10px] px-4 text-[14px] font-medium transition-[background-color,color,box-shadow] duration-[180ms] ease-[var(--ease-out)]",
                    active
                      ? "bg-[var(--gold-dim)] text-[var(--gold-core)] shadow-[var(--inset-gold)]"
                      : "text-[var(--ink-tertiary)] hover:bg-[var(--gold-dim)] hover:text-[var(--gold-core)]"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <item.icon aria-hidden="true" className="size-4" weight={active ? "duotone" : "regular"} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            <NotificationPanel
              channelName={notificationChannel}
              clientSlug={portalSlug}
              initialNotifications={initialNotifications}
              target="client"
            />
            <button
              className="ml-1 inline-flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-[13px] font-medium text-[var(--ink-tertiary)] transition-[background-color,color] duration-[180ms] ease-[var(--ease-out)] hover:bg-[var(--neutral-bg)] hover:text-[var(--ink-primary)]"
              type="button"
            >
              <SignOut aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-16">{children}</main>

      <footer className="relative border-t border-[var(--border-hairline)] bg-[var(--bg-base)] px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-[13px] text-[var(--ink-tertiary)]">
            Powered by{" "}
            <span className="font-medium text-[var(--ink-secondary)]">PortalOS</span>
            {" / "}
            {agencyName}
          </p>
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Private client room</p>
        </div>
      </footer>
    </div>
  );
}
