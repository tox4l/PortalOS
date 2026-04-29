"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-void)] px-4">
      <div className="text-center">
        <p className="section-label">Error</p>
        <h1 className="mt-6 font-display text-5xl font-light leading-tight tracking-[-0.02em] md:text-6xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-[var(--ink-secondary)]">
          An unexpected error occurred. Please try again, or return to the home page.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCw aria-hidden="true" className="size-4" />
            Try again
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
