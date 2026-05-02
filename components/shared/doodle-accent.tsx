"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, stagger } from "animejs";

type DoodleVariant = "squiggle" | "circle" | "highlight" | "asterisk" | "dots";

/* ─── SVG paths — organic, hand-drawn curves ─── */

function SquigglePath() {
  return (
    <path
      d="M0 12c6-3 14-5 20-2 5 2.5 7 7 13 5 4-1.5 7-4 12-3 3.5.7 6 2.5 10 2 3.5-.5 6-3 10-2.5 3 .4 6 2 9 1.5 2.5-.4 5-1.5 7.5-.8"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  );
}

function CirclePath() {
  return (
    <path
      d="M80 10 C132 5, 156 22, 156 42 C156 64, 132 78, 80 76 C28 74, 4 62, 4 42 C4 22, 24 15, 80 10"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
    />
  );
}

function HighlighterPath() {
  return (
    <path
      d="M2 10c8-4 16-8 24-6 6 1.5 10 6 16 5 4-.8 7-4 11-4 3.5 0 7 2.5 11 3 3.5.4 7-1 10.5-2"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="5"
      opacity="0.3"
    />
  );
}

function AsteriskPath() {
  return (
    <>
      <path d="M10 2v16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M3 5l14 10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M3 15l14-10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </>
  );
}

function DotsPath() {
  return (
    <>
      <circle cx="4" cy="4" fill="currentColor" opacity="0.5" r="2.5" />
      <circle cx="18" cy="4" fill="currentColor" opacity="0.4" r="2.2" />
      <circle cx="32" cy="4" fill="currentColor" opacity="0.3" r="1.8" />
      <circle cx="44" cy="4" fill="currentColor" opacity="0.35" r="2" />
      <circle cx="56" cy="4" fill="currentColor" opacity="0.45" r="2.5" />
    </>
  );
}

/* ─── ViewBox config per variant ─── */

const variantConfig: Record<DoodleVariant, { viewBox: string; render: () => ReactNode }> = {
  squiggle: { viewBox: "0 0 84 18", render: () => <SquigglePath /> },
  circle: { viewBox: "0 0 160 86", render: () => <CirclePath /> },
  highlight: { viewBox: "0 0 86 18", render: () => <HighlighterPath /> },
  asterisk: { viewBox: "0 0 20 20", render: () => <AsteriskPath /> },
  dots: { viewBox: "0 0 60 8", render: () => <DotsPath /> },
};

type DoodleAccentProps = {
  variant?: DoodleVariant;
  className?: string;
};

export function DoodleAccent({ variant = "squiggle", className = "" }: DoodleAccentProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const drawnRef = useRef(false);

  const { viewBox, render } = variantConfig[variant];

  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container || drawnRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || drawnRef.current) return;
        drawnRef.current = true;

        const pathTargets = svg.querySelectorAll<SVGPathElement>("path");
        const circleTargets = svg.querySelectorAll<SVGCircleElement>("circle");

        // SVG line-drawing for paths: set dasharray/dashoffset to length, then animate to 0
        for (const path of pathTargets) {
          const length = path.getTotalLength();
          path.setAttribute("stroke-dasharray", String(length));
          path.setAttribute("stroke-dashoffset", String(length));
        }

        // Animate stroke paths
        if (pathTargets.length > 0) {
          animate(Array.from(pathTargets), {
            strokeDashoffset: 0,
            duration: 1200,
            delay: stagger(80),
            easing: "easeOutQuad",
          });
        }

        // Animate circles: fade in with stagger
        if (circleTargets.length > 0) {
          animate(Array.from(circleTargets), {
            opacity: [0, (el: SVGCircleElement) => parseFloat(el.getAttribute("opacity") || "0.4")],
            scale: [0.5, 1],
            duration: 600,
            delay: stagger(80),
            easing: "easeOutQuad",
          });
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [variant]);

  return (
    <span
      ref={containerRef}
      aria-hidden="true"
      className={`doodle-accent pointer-events-none inline-block select-none align-middle leading-[0] ${className}`}
    >
      <svg
        ref={svgRef}
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        {render()}
      </svg>
    </span>
  );
}

type DoodleWordProps = {
  children: ReactNode;
  variant?: DoodleVariant;
};

export function DoodleWord({ children, variant = "squiggle" }: DoodleWordProps) {
  return (
    <span className="relative inline-block">
      {variant === "circle" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ margin: "-0.45em -0.35em", zIndex: -1 }}
        >
          <span style={{ width: "100%" }}>
            <DoodleAccent variant={variant} />
          </span>
        </span>
      )}
      {children}
      {variant !== "circle" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 flex justify-center"
          style={{ bottom: variant === "highlight" ? "-0.55em" : "-0.25em" }}
        >
          <span style={{ width: variant === "asterisk" ? "1em" : "90%" }}>
            <DoodleAccent variant={variant} />
          </span>
        </span>
      )}
    </span>
  );
}
