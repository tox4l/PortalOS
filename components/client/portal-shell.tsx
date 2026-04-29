"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Buildings, SignOut, type Icon } from "@phosphor-icons/react";
import { NotificationPanel } from "@/components/shared/notification-panel";
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
    return `rgba(212, 175, 55, ${alpha})`;
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
    { href: `/portal/${portalSlug}`, label: "Projects", icon: Briefcase }
  ];

  return (
    <div
      className="min-h-[100dvh] bg-[var(--bg-void)] text-[var(--ink-primary)]"
      style={brandVars}
    >
      <div className="pointer-events-none fixed inset-0 lux-grid opacity-[0.12]" aria-hidden="true" />
      <header className="sticky top-0 z-20 border-b border-[var(--border-default)] bg-[rgba(10,10,11,0.86)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              className="group inline-flex min-w-0 items-center gap-3"
              href={`/portal/${portalSlug}`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-gold-dim)] bg-[var(--gold-dim)] font-display text-[18px] text-[var(--gold-core)] shadow-[var(--inset-gold)]">
                {agencyName.charAt(0)}
              </span>
              <span className="truncate font-display text-2xl font-normal tracking-[-0.01em] text-[var(--ink-primary)] transition-colors group-hover:text-[var(--gold-core)]">
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
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/projects`);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-[8px] px-3 text-[14px] font-medium transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    active
                      ? "bg-[var(--gold-dim)] text-[var(--gold-core)] shadow-[var(--inset-gold)]"
                      : "text-[var(--ink-tertiary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--ink-secondary)]"
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
              className="ml-1 inline-flex min-h-10 items-center gap-2 rounded-[8px] px-3 text-[13px] font-medium text-[var(--ink-tertiary)] transition-[background-color,color] duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--ink-secondary)]"
              type="button"
            >
              <SignOut aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1280px] px-4 py-8 md:px-8 md:py-12">{children}</main>

      <footer className="relative border-t border-[var(--border-default)] bg-[var(--bg-void)] px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-[13px] text-[var(--ink-tertiary)]">
            Powered by{" "}
            <span className="font-medium text-[var(--ink-secondary)]">PortalOS</span>
            {" / "}
            {agencyName}
          </p>
          <p className="lux-meta">Private client room</p>
        </div>
      </footer>
    </div>
  );
}
