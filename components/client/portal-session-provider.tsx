"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Client-side session guard for the portal layout.
 *
 * Checks for the presence of the client-session cookie when the page loads
 * and whenever the user returns to the tab. If the session disappears (expired
 * cookie, cleared storage, etc.), this component shows an inline message
 * instead of hard-redirecting — preventing redirect chains.
 *
 * Auth-free paths (login, auth callback) are always rendered as-is.
 */
export function PortalSessionProvider({
  children,
  portalSlug,
}: {
  children: React.ReactNode;
  portalSlug: string;
}) {
  const pathname = usePathname();
  const [sessionMissing, setSessionMissing] = useState(false);

  // Skip the guard entirely on auth-related pages
  const isAuthPage =
    pathname === `/portal/${portalSlug}/login` ||
    pathname.startsWith(`/portal/${portalSlug}/auth/`);

  useEffect(() => {
    if (isAuthPage) return;

    function checkSession() {
      const hasSession = document.cookie.includes("portalos-client-session");
      setSessionMissing(!hasSession);
    }

    // Check immediately and on visibility change (user returns from another tab)
    checkSession();
    document.addEventListener("visibilitychange", checkSession);
    return () => document.removeEventListener("visibilitychange", checkSession);
  }, [isAuthPage]);

  if (sessionMissing) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center p-5">
        <div className="mx-auto max-w-md rounded-[8px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)] p-8 text-center">
          <p className="text-[16px] font-medium text-[var(--ink-primary)]">
            Session expired
          </p>
          <p className="mt-2 text-[14px] leading-[1.6] text-[var(--ink-secondary)]">
            Your session has ended. Please sign in again to continue.
          </p>
          <Link
            href={`/portal/${portalSlug}/login`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--gold-core)] px-6 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Sign in to portal
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
