"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-void)] px-4">
      <div className="mx-auto max-w-[480px] text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--gold-core)]">
          Error
        </p>
        <h1 className="mt-6 font-display text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.1] tracking-[-0.02em] text-[var(--ink-primary)]">
          Something went wrong
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-[var(--ink-secondary)]">
          An unexpected error occurred. Please try again, or return to the home page.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-transparent bg-[var(--gold-core)] px-4 text-[14px] font-medium text-[#0A0A0B] transition-colors hover:bg-[var(--gold-bright)]"
            onClick={reset}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Try again
          </button>
          <a
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[var(--border-subtle)] bg-transparent px-4 text-[14px] font-medium text-[var(--ink-primary)] no-underline transition-colors hover:border-[var(--border-visible)] hover:bg-[rgba(255,255,255,0.04)]"
            href="/"
          >
            <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
