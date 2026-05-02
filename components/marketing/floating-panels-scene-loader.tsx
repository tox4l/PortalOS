"use client";

import dynamic from "next/dynamic";

const FloatingPanelsScene = dynamic(
  () => import("@/components/marketing/floating-panels-scene").then((mod) => mod.FloatingPanelsScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[900px] w-full items-center justify-center overflow-hidden">
        <div className="grid w-full max-w-[720px] gap-6 p-6">
          <div className="skeleton h-28 rounded-[5px]" />
          <div className="skeleton ml-auto h-24 w-4/5 rounded-[5px]" />
          <div className="skeleton h-32 w-11/12 rounded-[5px]" />
        </div>
      </div>
    )
  }
);

export function FloatingPanelsSceneLoader() {
  return <FloatingPanelsScene />;
}
