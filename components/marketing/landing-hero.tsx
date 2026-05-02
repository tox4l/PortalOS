"use client";

import { useRef } from "react";
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
  const lineRefs = useRef<HTMLDivElement[]>([]);
  const wordRefs = useRef<HTMLSpanElement[]>([]);
  const wordIndexRef = useRef(0);
  wordIndexRef.current = 0;

  useGSAP(
    () => {
      gsap.killTweensOf([wordRefs.current, lineRefs.current, subheadlineRef.current, ctaRef.current, ruleRef.current, eyebrowRef.current]);

      gsap.set(wordRefs.current, {
        clipPath: "inset(0 100% 0 0)",
        opacity: 0.18,
        y: 18
      });
      gsap.set([subheadlineRef.current, ctaRef.current], {
        opacity: 0,
        y: 16
      });
      gsap.set(lineRefs.current, {
        scaleX: 0,
        transformOrigin: "left center"
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
          width: 64,
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
    },
    { scope: sectionRef }
  );

  return (
    <section
      className="relative isolate flex min-h-[100dvh] items-center overflow-hidden"
      ref={sectionRef}
    >
      <div className="absolute inset-0 luminary-glow" />
      <div className="absolute inset-0 sun-ray" />
      <div className="absolute inset-x-0 top-[12%] h-[1px] bg-[linear-gradient(90deg,transparent,var(--gold-muted),transparent)]" />

      <div className="relative z-[2] mx-auto grid w-full max-w-[1280px] items-center gap-16 px-4 pt-32 pb-20 md:px-8 md:pt-36 md:pb-28 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="flex flex-col lg:mx-auto lg:max-w-[620px]">
          <p
            className="inline-flex items-center gap-3 self-start text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--gold-core)]"
            ref={eyebrowRef}
          >
            <span className="h-px w-10 bg-[var(--gold-muted)]" />
            PortalOS
          </p>

          <div className="mt-12">
            <h1 className="font-display text-[clamp(3rem,7.5vw,6rem)] font-normal leading-[1.05] tracking-[-0.03em] text-[var(--ink-primary)]">
              {headlineLines.map((line, lineIndex) => (
                <div
                  className="block"
                  key={line}
                  ref={(element) => {
                    if (element) lineRefs.current[lineIndex] = element;
                  }}
                >
                  {line.split(" ").map((word) => {
                    const refIndex = wordIndexRef.current++;
                    return (
                      <span
                        className="mr-[0.24em] inline-block will-change-transform"
                        key={`${line}-${word}`}
                        ref={(element) => {
                          if (element) wordRefs.current[refIndex] = element;
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
            className="mt-10 h-[2px] bg-[var(--gold-core)]"
            ref={ruleRef}
            style={{ width: 64 }}
          />

          <p
            className="mt-10 max-w-[560px] text-[18px] leading-8 text-[var(--ink-secondary)] md:text-[19px]"
            ref={subheadlineRef}
          >
            Replace the email chains, Drive folders, and chasing clients with one beautiful portal.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 lg:items-end" ref={ctaRef}>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <Button asChild size="lg">
              <Link href="/demo/agency">
                Tour the agency view
                <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo/client">
                Tour the client room
                <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
              </Link>
            </Button>
          </div>
          <p className="text-[11px] uppercase tracking-[0.10em] text-[var(--ink-tertiary)] lg:text-right">
            No account &middot; No setup &middot; Just enter
          </p>
        </div>
      </div>
    </section>
  );
}
