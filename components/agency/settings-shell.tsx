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
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]"
        href="/app/dashboard"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        Back to dashboard
      </Link>

      <section className="lux-panel p-6 md:p-8">
        <p className="section-label">Agency settings</p>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <h2 className="mt-7 max-w-[720px] font-display text-[clamp(3rem,5vw,5.4rem)] font-normal leading-[0.98] tracking-[-0.025em] text-[var(--ink-primary)] text-balance">
              The machinery behind the room.
            </h2>
            <p className="mt-7 max-w-[620px] text-[16px] leading-7 text-[var(--ink-secondary)]">
              Tune team access, client-facing identity, and the quiet controls clients never need to see.
            </p>
          </div>
          <div className="grid content-end gap-3">
            {["Team permissions", "Portal branding", "Client access"].map((label) => (
              <div className="border-b border-[var(--border-default)] py-4 last:border-b-0" key={label}>
                <p className="lux-meta">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="lux-panel p-1">
        <nav aria-label="Settings sections" className="grid grid-cols-2 gap-1">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] px-3 text-[14px] font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isActive
                    ? "bg-[var(--gold-dim)] text-[var(--gold-core)] shadow-[var(--inset-gold)]"
                    : "text-[var(--ink-tertiary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--ink-secondary)]"
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
