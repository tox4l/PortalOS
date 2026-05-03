import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Palette, UsersThree, HardDrive } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { getAgencyStorageUsage, getStorageLimitBytes, formatBytes } from "@/lib/storage-quota";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.agencyId) redirect("/login");

  const usedBytes = await getAgencyStorageUsage(session.user.agencyId);
  const limitBytes = getStorageLimitBytes();
  const percentUsed = limitBytes > 0 ? (usedBytes / limitBytes) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="section-label">Workspace</p>
        <h1 className="mt-2 font-display text-[2.5rem] font-normal leading-tight tracking-[-0.02em] text-[var(--ink-primary)]">
          Settings
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-[var(--ink-secondary)]">
          Manage your agency workspace, team, and storage.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          className="surface-panel surface-panel-interactive flex items-center gap-4 p-5"
          href="/app/settings/team"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-sunken)]">
            <UsersThree aria-hidden="true" className="size-5 text-[var(--ink-secondary)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[14px] font-medium text-[var(--ink-primary)]">Team</p>
            <p className="text-[13px] text-[var(--ink-tertiary)]">Members, roles, and invitations</p>
          </div>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-[var(--ink-tertiary)]" />
        </Link>
        <Link
          className="surface-panel surface-panel-interactive flex items-center gap-4 p-5"
          href="/app/settings/branding"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-sunken)]">
            <Palette aria-hidden="true" className="size-5 text-[var(--ink-secondary)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[14px] font-medium text-[var(--ink-primary)]">Branding</p>
            <p className="text-[13px] text-[var(--ink-tertiary)]">Logo and brand color</p>
          </div>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-[var(--ink-tertiary)]" />
        </Link>
      </div>

      {/* Storage usage */}
      <div className="surface-panel p-6">
        <div className="flex items-center gap-3 mb-5">
          <HardDrive aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" />
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">
            Storage usage
          </p>
        </div>
        <p className="font-display text-[2rem] font-normal leading-none text-[var(--ink-primary)]">
          {formatBytes(usedBytes)}{" "}
          <span className="text-[var(--ink-tertiary)] text-[16px]">of {formatBytes(limitBytes)}</span>
        </p>
        <div className="mt-4 h-1 rounded-full bg-[var(--bg-sunken)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--gold-core)] transition-[width] duration-500 ease-[var(--ease-out)]"
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>
        <p className="font-serif italic text-sm text-[var(--ink-tertiary)] mt-2">
          Additional storage available Q3 2026.
        </p>
      </div>
    </div>
  );
}
