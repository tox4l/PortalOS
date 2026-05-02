"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function HorizontalScrollSection({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const container = containerRef.current;
      if (!section || !container) return;

      const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-horizontal-card]"));
      if (cards.length === 0) return;

      const totalScroll = container.scrollWidth - window.innerWidth;

      ScrollTrigger.create({
        trigger: section,
        start: "top 30%",
        end: () => `+=${totalScroll + 400}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      // Pre-set initial state
      cards.forEach((card) => {
        gsap.set(card, { opacity: 0.22, scale: 0.72 });
        card.style.boxShadow = "";
        card.style.borderColor = "";
        card.style.background = "";
      });

      gsap.to(container, {
        x: () => -(container.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 30%",
          end: () => `+=${totalScroll + 400}`,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: () => {
            const viewportCenter = window.innerWidth / 2;

            for (const card of cards) {
              const rect = card.getBoundingClientRect();
              const cardCenter = rect.left + rect.width / 2;
              const distance = Math.abs(cardCenter - viewportCenter);
              const maxDist = window.innerWidth * 0.5;
              const focus = Math.max(0, Math.min(1, 1 - distance / maxDist));

              const scale = 0.72 + focus * 0.48;
              const opacity = 0.22 + focus * 0.78;

              gsap.to(card, {
                scale,
                opacity,
                duration: 0.35,
                ease: "power2.out",
                overwrite: "auto",
              });

              if (focus > 0.65) {
                const glowIntensity = (focus - 0.65) / 0.35;
                gsap.to(card, {
                  boxShadow: `0 0 ${48 * glowIntensity}px rgba(180, 130, 50, ${0.35 * glowIntensity}), 0 0 ${100 * glowIntensity}px rgba(180, 100, 30, ${0.12 * glowIntensity})`,
                  borderColor: `rgba(180, 130, 50, ${0.25 + 0.45 * glowIntensity})`,
                  duration: 0.35,
                  ease: "power2.out",
                  overwrite: "auto",
                });
                card.style.background = `rgba(180, 130, 50, ${0.04 + 0.06 * glowIntensity})`;
              } else {
                gsap.to(card, {
                  boxShadow: "",
                  borderColor: "",
                  duration: 0.35,
                  ease: "power2.out",
                  overwrite: "auto",
                });
                card.style.background = "";
              }
            }
          },
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <div
        ref={containerRef}
        className="flex items-center gap-20"
        style={{
          width: "max-content",
          paddingLeft: "max(2rem, calc((100vw - 780px) / 2))",
          paddingRight: "max(2rem, calc((100vw - 780px) / 2))",
          minHeight: "560px",
        }}
      >
        {children}
      </div>
    </section>
  );
}
