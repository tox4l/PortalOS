"use client";

import dynamic from "next/dynamic";

const FloatingPanelsScene = dynamic(
  () => import("@/components/marketing/floating-panels-scene").then((mod) => mod.FloatingPanelsScene),
  {
    ssr: false,
    loading: () => (
      <div className="lux-panel flex min-h-[420px] items-center justify-center overflow-hidden">
        <div className="grid w-full max-w-[520px] gap-3 p-6">
          <div className="h-24 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)]" />
          <div className="ml-auto h-20 w-4/5 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)]" />
          <div className="h-28 w-11/12 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)]" />
        </div>
      </div>
    )
  }
);

export function FloatingPanelsSceneLoader() {
  return <FloatingPanelsScene />;
}
