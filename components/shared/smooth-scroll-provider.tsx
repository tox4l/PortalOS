"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef } from "react";

type SmoothScrollContextValue = {
  scrollTo: (target: string | HTMLElement | number) => void;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true
    });

    lenisRef.current = lenis;
    let frame = 0;

    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <SmoothScrollContext.Provider
      value={{
        scrollTo: (target) => lenisRef.current?.scrollTo(target)
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
