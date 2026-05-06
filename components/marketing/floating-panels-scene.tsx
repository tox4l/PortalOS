"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface PanelSpec {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  delay: number;
  tint: string;
}

const panels: PanelSpec[] = [
  { x: -20, y: 8, scale: 1.05, rotation: -3, delay: 0, tint: "rgba(240, 231, 213, 0.12)" },
  { x: 28, y: -4, scale: 1.1, rotation: 2, delay: 0.4, tint: "rgba(251, 246, 236, 0.10)" },
  { x: -8, y: -14, scale: 0.95, rotation: -1.5, delay: 0.8, tint: "rgba(140, 115, 64, 0.08)" },
  { x: 12, y: 18, scale: 1.0, rotation: 4, delay: 1.2, tint: "rgba(220, 210, 190, 0.10)" },
  { x: -24, y: -6, scale: 1.08, rotation: -5, delay: 1.6, tint: "rgba(240, 231, 213, 0.09)" },
  { x: 16, y: -10, scale: 0.92, rotation: 1, delay: 2.0, tint: "rgba(251, 246, 236, 0.11)" },
];

export function FloatingPanelsScene() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isInteractive = !reducedMotion && visible;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      role="img"
      aria-label="Floating abstract panels representing project cards and deliverables"
    >
      {panels.map((panel, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-[16px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] shadow-[0_8px_40px_rgba(0,0,0,0.08)] backdrop-blur-sm"
          style={{
            width: "clamp(180px, 22vw, 320px)",
            height: "clamp(120px, 16vw, 220px)",
            transform: `translate(${panel.x}px, ${panel.y}px) rotate(${panel.rotation}deg) scale(${panel.scale})`,
            opacity: visible ? 1 : 0,
            transition: isInteractive
              ? `opacity 1s ease ${panel.delay}s, transform 4s ease-in-out ${panel.delay}s`
              : `opacity 1s ease ${panel.delay}s`,
            animation: isInteractive
              ? `panelFloat ${3 + i * 0.4}s ease-in-out ${panel.delay}s infinite alternate`
              : "none",
          }}
        >
          <div
            className="absolute inset-0 rounded-[16px]"
            style={{ background: panel.tint }}
          />
        </div>
      ))}
    </div>
  );
}
