"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Palette, UsersThree } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const settingsNavItems = [
  { href: "/app/settings/team", label: "Team", icon: UsersThree },
  { href: "/app/settings/branding", label: "Branding", icon: Palette }
];

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <Link
        className="inline-flex items-center gap-1.5 font-sans text-[0.8125rem] font-medium text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]"
        href="/app/dashboard"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        Back to dashboard
      </Link>

      <section className="surface-panel p-6 md:p-8">
        <p className="section-label">Agency settings</p>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h2 className="mt-6 max-w-[720px] font-display text-[clamp(2.5rem,5vw,4.5rem)] font-normal leading-[0.98] tracking-[-0.02em] text-[var(--ink-primary)] text-balance">
              The machinery behind the room.
            </h2>
            <p className="mt-6 max-w-[560px] font-sans text-[0.9375rem] leading-7 text-[var(--ink-secondary)]">
              Tune team access, client-facing identity, and the quiet controls clients never need to see.
            </p>
          </div>
          <div className="grid content-end gap-3">
            {["Team permissions", "Portal branding", "Client access"].map((label) => (
              <div className="border-b border-[var(--border-hairline)] py-3 last:border-b-0" key={label}>
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="surface-panel p-1">
        <nav aria-label="Settings sections" className="grid grid-cols-2 gap-1">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                className={cn(
                  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[5px] px-3 font-sans text-[0.8125rem] font-medium transition-[background-color,color] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isActive
                    ? "bg-[var(--gold-dim)] text-[var(--gold-core)]"
                    : "text-[var(--ink-tertiary)] hover:bg-[var(--neutral-bg)] hover:text-[var(--ink-secondary)]"
                )}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" className="size-4" weight={isActive ? "duotone" : "regular"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
