"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const headlineLines = ["The Agency Platform", "Your Clients Will Brag About."];

export function LandingHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const ruleRef = useRef<HTMLDivElement | null>(null);
  const subheadlineRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<HTMLDivElement[]>([]);
  const wordRefs = useRef<HTMLSpanElement[]>([]);

  const wordIndexRef = useRef(0);
  wordIndexRef.current = 0;

  useGSAP(
    () => {
      gsap.set(wordRefs.current, {
        clipPath: "inset(0 100% 0 0)",
        opacity: 0.18,
        y: 18
      });
      gsap.set([subheadlineRef.current, ctaRef.current, scrollRef.current], {
        opacity: 0,
        y: 16
      });
      gsap.set(lineRefs.current, {
        scaleX: 0,
        transformOrigin: "center center"
      });
      gsap.set(ruleRef.current, {
        width: 0
      });

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45 }
      );
      timeline.to(
        wordRefs.current,
        {
          clipPath: "inset(0 0% 0 0)",
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.04
        },
        "-=0.05"
      );
      timeline.to(
        lineRefs.current,
        {
          scaleX: 1,
          duration: 0.55,
          stagger: 0.08
        },
        "-=0.5"
      );
      timeline.to(
        ruleRef.current,
        {
          width: 48,
          duration: 0.38
        },
        "-=0.12"
      );
      timeline.to(
        subheadlineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.45
        },
        "-=0.05"
      );
      timeline.to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.45
        },
        "-=0.1"
      );
      timeline.to(
        scrollRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.45
        },
        "-=0.08"
      );
    },
    { scope: sectionRef }
  );

  useEffect(() => {
    const indicator = scrollRef.current;
    if (!indicator) {
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 18) {
        gsap.to(indicator, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          overwrite: true,
          pointerEvents: "none"
        });
      } else {
        gsap.to(indicator, {
          opacity: 1,
          y: 0,
          duration: 0.2,
          overwrite: true,
          pointerEvents: "auto"
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className="relative isolate flex min-h-[100dvh] items-center overflow-hidden px-4 pt-24 pb-18 md:px-8 md:pt-28 md:pb-24"
      ref={sectionRef}
    >
      <div className="absolute inset-0">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-24 contrast-125 grayscale"
          style={{
            backgroundImage:
              "url('https://picsum.photos/seed/portalos-hero-architecture/1920/1200')",
            backgroundColor: "#0A0A0B"
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),transparent_34%),linear-gradient(180deg,rgba(10,10,11,0.18),rgba(10,10,11,0.82)_40%,rgba(10,10,11,0.96))]" />
        <div className="absolute inset-x-0 top-[14%] h-[1px] bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.35),transparent)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <p
          className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--gold-core)]"
          ref={eyebrowRef}
        >
          <span className="h-px w-8 bg-[var(--gold-muted)]" />
          Velocity AI - PortalOS
          <span className="h-px w-8 bg-[var(--gold-muted)]" />
        </p>

        <div className="mt-8 max-w-5xl">
          <h1 className="font-display text-[clamp(1.35rem,5vw,2.2rem)] font-normal leading-[0.98] tracking-[-0.02em] text-[var(--ink-primary)] text-balance sm:text-[clamp(1.8rem,5vw,3rem)] md:text-[48px] lg:text-[64px] xl:text-[72px]">
            {headlineLines.map((line, lineIndex) => (
              <div
                className="block overflow-hidden"
                key={line}
                ref={(element) => {
                  if (element) {
                    lineRefs.current[lineIndex] = element;
                  }
                }}
              >
                {line.split(" ").map((word) => {
                  const refIndex = wordIndexRef.current++;

                  return (
                    <span
                      className="mr-[0.24em] inline-block will-change-transform"
                      key={`${line}-${word}`}
                      ref={(element) => {
                        if (element) {
                          wordRefs.current[refIndex] = element;
                        }
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            ))}
          </h1>
        </div>

        <div
          className="mt-8 h-px bg-[var(--gold-core)]"
          ref={ruleRef}
          style={{ width: 48 }}
        />

        <p
          className="mt-8 max-w-[780px] text-[17px] leading-8 text-[var(--ink-secondary)] md:text-[18px]"
          ref={subheadlineRef}
        >
          Replace the email chains, Drive folders, and chasing clients with one beautiful portal.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4" ref={ctaRef}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/demo/agency">
                Try Agency View
                <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo/client">
                Try Client View
                <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
              </Link>
            </Button>
          </div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
            No credit card. No setup. Just click.
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 pb-2" ref={scrollRef}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-tertiary)]">
            Scroll
          </p>
          <div className="relative h-10 w-px overflow-hidden bg-[rgba(212,175,55,0.18)]">
            <div className="absolute left-0 top-0 h-5 w-px animate-[scroll-pulse_1.4s_ease-in-out_infinite] bg-[var(--gold-core)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
