"use client";

import { Toaster } from "sonner";
import { useReveal } from "@/hooks/use-reveal";
import { SmoothScrollProvider } from "@/components/shared/smooth-scroll-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";

function RevealProvider({ children }: { children: React.ReactNode }) {
  useReveal();
  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SmoothScrollProvider>
        <RevealProvider>{children}</RevealProvider>
        <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hairline)",
            color: "var(--ink-primary)",
            boxShadow: "var(--shadow-lg)"
          }
        }}
      />
      </SmoothScrollProvider>
    </ThemeProvider>
  );
}
