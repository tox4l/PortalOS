import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-void)] px-4">
      <div className="text-center">
        <p className="section-label">404</p>
        <h1 className="mt-6 font-display text-5xl font-light leading-tight tracking-[-0.02em] md:text-6xl">
          Page not found
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-[var(--ink-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to home
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/app/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
