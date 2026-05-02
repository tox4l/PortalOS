"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ScrollAwareHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const scrolled = useScrollTop(20);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-[background-color,border-color] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled
          ? "border-[var(--border-hairline)] bg-[var(--bg-base)]"
          : "border-transparent bg-transparent",
        className
      )}
    >
      {children}
    </header>
  );
}
