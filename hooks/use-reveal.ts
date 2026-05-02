"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function useReveal() {
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    frameRef.current = window.setTimeout(() => {
      observerRef.current?.disconnect();

      const elements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal], .reveal")
      );

      if (elements.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const element = entry.target as HTMLElement;
            const delay = element.dataset.delay;
            if (delay) {
              element.style.animationDelay = `${delay}ms`;
            }

            element.classList.add("in-view");
            observer.unobserve(element);
          });
        },
        { threshold: 0.15 }
      );

      elements.forEach((element) => observer.observe(element));
      observerRef.current = observer;
    }, 33);

    return () => {
      clearTimeout(frameRef.current);
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [pathname]);
}
