"use client";

import { Toaster } from "sonner";
import { useReveal } from "@/hooks/use-reveal";
import { SmoothScrollProvider } from "@/components/shared/smooth-scroll-provider";

function RevealProvider({ children }: { children: React.ReactNode }) {
  useReveal();
  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <RevealProvider>{children}</RevealProvider>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-hairline)",
            borderTop: "1px solid rgba(255,255,255,0.10)",
            color: "var(--ink-primary)",
            boxShadow: "var(--shadow-lg)"
          }
        }}
      />
    </SmoothScrollProvider>
  );
}
