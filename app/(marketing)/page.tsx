"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { DoodleWord } from "@/components/shared/doodle-accent";
import {
  ArrowRight,
  Briefcase,
  Buildings,
  CaretDown,
  Check,
  FolderSimpleDashed,
  Rows,
  ShieldCheck,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/marketing/landing-hero";
import { FloatingPanelsSceneLoader } from "@/components/marketing/floating-panels-scene-loader";
import { ScrollAwareHeader } from "@/components/shared/scroll-aware-header";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { HorizontalScrollSection } from "@/components/marketing/horizontal-scroll-section";
import { SocialProofMarquee } from "@/components/marketing/social-proof-marquee";

const painPoints = [
  {
    title: "Feedback lives in too many places",
    description:
      "Client comments, internal notes, files, and approvals get scattered across inboxes and shared folders."
  },
  {
    title: "Project context disappears",
    description:
      "The brief, latest deck, and decision history rarely sit beside the conversation that explains them."
  },
  {
    title: "File handoff feels too fragile",
    description:
      "Final files, comments, and approvals get split across links that no one wants to police."
  }
];

const featureRows = [
  {
    eyebrow: "Agency command",
    title: "A working room for every client engagement.",
    description:
      "Boards, briefs, files, and comments live inside one project room. Your team sees the full operation while clients see only what is ready for them.",
    icon: Briefcase,
    bullets: ["Kanban workstream", "Brief and file history", "Client-safe visibility"],
    metric: "5 tabs",
    statLabel: "per project room"
  },
  {
    eyebrow: "Client portal",
    title: "A private entrance your clients will actually use.",
    description:
      "Each client gets a branded portal that makes status, deliverables, approvals, and comments feel intentional instead of improvised.",
    icon: Buildings,
    bullets: ["White-label rooms", "Magic-link access", "Approval controls"],
    metric: "1 link",
    statLabel: "for every decision"
  },
  {
    eyebrow: "Delivery memory",
    title: "Every decision stays attached to the work.",
    description:
      "Keep approvals, version history, and client-visible comments in one place so final delivery does not depend on memory.",
    icon: FolderSimpleDashed,
    bullets: ["Version history", "Approval timeline", "Client-safe records"],
    metric: "30",
    statLabel: "days of context"
  }
];

const demoCards = [
  {
    title: "Agency view",
    description: "Walk through the command side — see where your dashboard, projects, clients, and workspace will live.",
    href: "/demo/agency",
    icon: Rows,
    cta: "Tour agency view",
    stats: ["Project rooms", "Approval queue", "Team roster"]
  },
  {
    title: "Client view",
    description: "See the branded portal your clients will use — where files, approvals, and comments come together.",
    href: "/demo/client",
    icon: ShieldCheck,
    cta: "Tour client view",
    stats: ["Private room", "Magic link", "Review workflow"]
  }
];

const workspaceShapes = [
  {
    name: "Studio",
    description: "For small studios putting structure around client work.",
    features: ["Up to 3 clients", "10 active projects", "Client portal", "Email notifications", "5 GB storage"]
  },
  {
    name: "Growth",
    description: "For growing agencies with several active client rooms.",
    features: ["Up to 20 clients", "Unlimited projects", "AI brief generation", "Custom domain", "50 GB storage"],
    highlighted: true
  },
  {
    name: "White label",
    description: "For established agencies that need a higher-touch operation.",
    features: ["Unlimited clients", "Unlimited storage", "White-label email", "Advanced permissions", "Custom integrations"]
  }
];

const faqs = [
  {
    q: "Can the client portal use my brand?",
    a: "Yes. Client portals support your agency name, brand color, custom welcome message, and a custom domain."
  },
  {
    q: "How do clients sign in?",
    a: "Clients use a magic link. They do not need a password, and access is scoped to their own portal."
  },
  {
    q: "Can clients see internal agency notes?",
    a: "No. Internal comments stay on the agency side. Client-facing threads and shared deliverables are separated."
  },
  {
    q: "Can I start with a demo first?",
    a: "Yes. The demo data remains available for exploring the full workflow."
  }
];

function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            className="surface-panel overflow-hidden"
            data-delay={i * 50}
            data-reveal
            key={faq.q}
          >
            <button
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-medium text-[var(--ink-primary)]"
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              {faq.q}
              <CaretDown
                aria-hidden="true"
                className={`size-5 shrink-0 text-[var(--gold-core)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                weight="bold"
              />
            </button>
            <div className={`faq-answer ${isOpen ? "open" : ""}`}>
              <div className="border-t border-[var(--border-hairline)] px-6 py-5 text-[15px] leading-7 text-[var(--ink-secondary)]">
                {faq.a}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  const pathname = usePathname();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div key={pathname} className="min-h-[100dvh] bg-[var(--bg-void)] text-[var(--ink-primary)]">
      <div className={`demo-backdrop ${hoveredCard ? "active" : ""}`} aria-hidden="true" />
      <ScrollAwareHeader>
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link className="font-display text-2xl font-normal tracking-[-0.01em] text-[var(--gold-core)]" href="/">
            PortalOS
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] font-medium text-[var(--ink-tertiary)] md:flex">
            <Link className="transition-colors hover:text-[var(--ink-secondary)]" href="#platform">Platform</Link>
            <Link className="transition-colors hover:text-[var(--ink-secondary)]" href="#features">Features</Link>
            <Link className="transition-colors hover:text-[var(--ink-secondary)]" href="#fit">Fit</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </ScrollAwareHeader>

      <main className="w-full max-w-full overflow-x-hidden">
        <LandingHero />

        <div className="clip-angle-up bg-[var(--bg-void)]">
          <section className="mx-auto max-w-[1280px] px-4 py-28 md:px-8 lg:py-36" id="platform">
            <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div data-reveal>
                <p className="section-label">The product</p>
                <h2 className="mt-6 max-w-[680px] font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.05] tracking-[-0.025em] text-[var(--ink-primary)] text-balance sm:text-[clamp(2.4rem,5vw,4rem)] md:text-[clamp(2.8rem,5vw,5.2rem)]">
                  Client work, arranged like a <DoodleWord variant="highlight">private operating room.</DoodleWord>
                </h2>
                <p className="mt-6 max-w-[580px] text-[16px] leading-7 text-[var(--ink-secondary)]">
                  PortalOS gives agencies one disciplined surface for the entire engagement, from the first brief to the final handoff.
                </p>
                <div className="mt-8 grid max-w-[560px] grid-cols-3 gap-px overflow-hidden rounded-[8px] border border-[var(--border-hairline)] bg-[var(--border-hairline)]">
                  {[
                    ["Projects", "07"],
                    ["Reviews", "05"],
                    ["Due", "14"]
                  ].map(([label, value]) => (
                    <div className="bg-[var(--bg-base)] p-5" key={label}>
                      <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">{label}</p>
                      <p className="mt-3 font-display text-[24px] leading-none tracking-[-0.02em] text-[var(--ink-primary)]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center" data-delay={90} data-reveal>
                <FloatingPanelsSceneLoader />
              </div>
            </div>
          </section>
        </div>

        <SocialProofMarquee />

        <div className="clip-angle-down bg-[var(--bg-base)]">
          <section className="mx-auto max-w-[1280px] px-4 py-32 md:px-8 lg:py-40">
            <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div className="lg:sticky lg:top-28" data-reveal>
                <p className="section-label">The problem</p>
                <h2 className="mt-6 font-display text-[clamp(2rem,4.6vw,3.2rem)] font-normal leading-[1.06] tracking-[-0.025em] text-balance sm:text-[clamp(2.4rem,4.6vw,4rem)] md:text-[clamp(2.8rem,4.6vw,5rem)]">
                  The work is good. The delivery room is usually the <DoodleWord variant="squiggle">weak part.</DoodleWord>
                </h2>
                <div className="mt-8 hidden lg:block">
                  <div className="h-px w-20 bg-[var(--border-gold)]" />
                  <p className="mt-6 font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--ink-tertiary)]">Three common fractures</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Scattered feedback", "Lost context", "Fragile handoffs"].map((tag) => (
                      <span className="inline-block rounded-full border border-[var(--border-hairline)] bg-[var(--bg-sunken)] px-4 py-1.5 font-sans text-[12px] text-[var(--ink-secondary)]" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                {painPoints.map((point, index) => (
                  <article
                    className="group py-10 first:pt-0 last:pb-0"
                    data-delay={index * 80}
                    data-reveal
                    key={point.title}
                  >
                    <div className="flex gap-6">
                      <div className="flex shrink-0 flex-col items-center gap-3 pt-1">
                        <span className="font-mono text-[13px] tabular-nums text-[var(--gold-muted)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="gold-rule-vertical h-full min-h-[60px]" />
                      </div>
                      <div>
                        <h3 className="font-display text-[26px] font-normal leading-tight text-[var(--ink-primary)]">
                          {point.title}
                        </h3>
                        <p className="mt-3 max-w-[540px] text-[15px] leading-7 text-[var(--ink-secondary)]">
                          {point.description}
                        </p>
                      </div>
                    </div>
                    {index < painPoints.length - 1 && (
                      <div className="mt-8 ml-[52px] h-px bg-[var(--border-hairline)]" />
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="clip-angle-up bg-[var(--bg-void)]">
          <section className="py-24 lg:py-32" id="features">
            <div className="mx-auto max-w-[1280px] px-4 md:px-8">
              <div className="max-w-[760px]" data-reveal>
                <p className="section-label">Features</p>
                <h2 className="mt-6 font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance sm:text-[clamp(2.4rem,5vw,4rem)] md:text-[clamp(2.8rem,5vw,5.2rem)]">
                  Built for the invisible <DoodleWord variant="circle">work</DoodleWord> that makes clients trust you.
                </h2>
              </div>
            </div>

            <div className="mt-16">
              <HorizontalScrollSection>
                {featureRows.map((feature, index) => (
                  <article
                    className="grid w-[min(85vw,720px)] shrink-0 gap-10 lg:grid-cols-2 lg:items-center"
                    data-horizontal-card
                    key={feature.title}
                  >
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--gold-muted)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="mt-4 font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)] text-[var(--gold-core)]">{feature.eyebrow}</p>
                      <h3 className="mt-4 font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-normal leading-[1.08] tracking-[-0.015em] text-[var(--ink-primary)]">
                        {feature.title}
                      </h3>
                      <p className="mt-4 max-w-[420px] text-[15px] leading-7 text-[var(--ink-secondary)]">
                        {feature.description}
                      </p>
                      <ul className="mt-6 grid gap-2.5">
                        {feature.bullets.map((bullet) => (
                          <li className="flex items-center gap-3 text-[14px] text-[var(--ink-secondary)]" key={bullet}>
                            <Check aria-hidden="true" className="size-4 shrink-0 text-[var(--gold-core)]" weight="bold" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="surface-panel min-h-[360px] p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex size-12 items-center justify-center rounded-[7px] border border-[var(--border-hairline)] bg-[var(--bg-base)]">
                          <feature.icon aria-hidden="true" className="size-5 text-[var(--gold-core)]" weight="duotone" />
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[32px] leading-none">{feature.metric}</p>
                          <p className="mt-1 font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">{feature.statLabel}</p>
                        </div>
                      </div>
                      <div className="mt-8 grid gap-3">
                        {feature.bullets.map((bullet, bulletIndex) => (
                          <div className="rounded-[7px] border border-[var(--border-hairline)] bg-[var(--bg-base)] p-4" key={bullet}>
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-[14px] font-medium text-[var(--ink-primary)]">{bullet}</p>
                              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                                0{bulletIndex + 1}
                              </span>
                            </div>
                            <div className="mt-4 h-1.5 rounded-full bg-[var(--bg-sunken)]">
                              <div
                                className="h-full rounded-full bg-[var(--gold-500)]"
                                style={{ width: `${68 + bulletIndex * 10}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </HorizontalScrollSection>
            </div>
          </section>
        </div>

        <div className="bg-[var(--bg-base)]">
          <section className="relative mx-auto max-w-[1280px] px-4 py-32 md:px-8 lg:py-40" id="demo">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-end">
              <div data-reveal>
                <p className="section-label">Product tour</p>
                <h2 className="mt-6 font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance sm:text-[clamp(2.4rem,5vw,4rem)] md:text-[clamp(2.8rem,5vw,5.2rem)]">
                  Walk through both sides of the room.
                </h2>
                <p className="mt-6 max-w-[560px] text-[16px] leading-7 text-[var(--ink-secondary)]">
                  Each section explains what goes where — so you know exactly what your team and clients will experience.
                </p>
              </div>
              <div className="relative grid gap-4 md:grid-cols-2">
                {demoCards.map((card, index) => {
                  const isActive = hoveredCard === card.title;
                  const yOffset = index === 1 ? 32 : 0;
                  return (
                    <motion.article
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: yOffset }}
                      viewport={{ once: true, amount: 0.3 }}
                      animate={{
                        scale: isActive ? 1.08 : hoveredCard ? 0.94 : 1,
                        opacity: hoveredCard && !isActive ? 0.35 : 1,
                        zIndex: isActive ? 50 : 40,
                      }}
                      className="surface-panel relative overflow-hidden p-6"
                      key={card.title}
                      onMouseEnter={() => setHoveredCard(card.title)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        boxShadow: isActive
                          ? "0 0 80px rgba(180, 130, 50, 0.38), 0 0 160px rgba(200, 120, 30, 0.18), 0 16px 50px rgba(30, 20, 10, 0.10)"
                          : undefined,
                        borderColor: isActive ? "var(--border-gold-hot)" : undefined,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 20,
                        mass: 0.8,
                      }}
                    >
                      {isActive && (
                        <motion.div
                          animate={{ opacity: 1 }}
                          className="pointer-events-none absolute inset-0 rounded-[14px]"
                          initial={{ opacity: 0 }}
                          style={{
                            background: "radial-gradient(ellipse at center, rgba(180, 130, 50, 0.10) 0%, transparent 70%)",
                          }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                        />
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex size-12 items-center justify-center rounded-[7px] border border-[var(--border-hairline)] bg-[var(--bg-base)]">
                          <card.icon aria-hidden="true" className="size-5 text-[var(--gold-core)]" weight="duotone" />
                        </div>
                        <Badge variant={index === 0 ? "review" : "approved"}>{index === 0 ? "Team" : "Client"}</Badge>
                      </div>
                      <h3 className="mt-8 font-display text-[30px] font-normal leading-tight text-[var(--ink-primary)]">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-[14px] leading-6 text-[var(--ink-secondary)]">{card.description}</p>
                      <div className="mt-6 divide-y divide-[var(--border-hairline)] border-y border-[var(--border-hairline)]">
                        {card.stats.map((stat) => (
                          <p className="py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]" key={stat}>
                            {stat}
                          </p>
                        ))}
                      </div>
                      <Button asChild className="mt-6 w-full" variant={index === 0 ? undefined : "secondary"}>
                        <Link href={card.href}>
                          {card.cta}
                          <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
                        </Link>
                      </Button>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <div className="clip-angle-down bg-[var(--bg-base)]">
          <section className="mx-auto max-w-[1280px] px-4 py-32 md:px-8 lg:py-40" id="fit">
            <div className="mx-auto max-w-[700px] text-center" data-reveal>
              <p className="section-label justify-center">Fit</p>
              <h2 className="mt-6 font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance sm:text-[clamp(2.4rem,5vw,4rem)] md:text-[clamp(2.8rem,5vw,5.2rem)]">
                Start focused. Keep the room.
              </h2>
              <p className="mt-6 text-[16px] leading-7 text-[var(--ink-secondary)]">
                Pick the operating shape that matches your studio.
              </p>
            </div>

            <div className="mt-16 grid gap-5 lg:grid-cols-3">
              {workspaceShapes.map((shape, index) => (
                <article
                  className={`surface-panel surface-panel-interactive p-6 ${shape.highlighted ? "border-[var(--border-gold)] shadow-[var(--shadow-glow)]" : ""}`}
                  data-delay={index * 80}
                  data-reveal
                  key={shape.name}
                  style={{
                    transform: `translateY(${index === 0 ? 0 : index === 1 ? -12 : 6}px)`
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-[28px] font-normal text-[var(--ink-primary)]">{shape.name}</h3>
                    {shape.highlighted ? <Badge variant="review">Most chosen</Badge> : null}
                  </div>
                  <p className="mt-3 min-h-12 text-[14px] leading-6 text-[var(--ink-secondary)]">{shape.description}</p>
                  <ul className="mt-7 space-y-3">
                    {shape.features.map((feature) => (
                      <li className="flex items-center gap-3 text-[14px] text-[var(--ink-secondary)]" key={feature}>
                        <Check aria-hidden="true" className="size-4 shrink-0 text-[var(--gold-core)]" weight="bold" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {shape.name === "White label" ? (
                    <div className="mt-8 w-full">
                      <Badge variant="draft" className="w-full justify-center py-2.5 text-[12px] tracking-[0.08em]">
                        Coming Q3 2026
                      </Badge>
                    </div>
                  ) : (
                    <Button asChild className="mt-8 w-full" variant={shape.highlighted ? undefined : "secondary"}>
                      <Link href="/onboarding">{shape.highlighted ? "Open showroom" : "Start setup"}</Link>
                    </Button>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="clip-angle-up bg-[var(--bg-void)]">
          <section className="mx-auto max-w-[1280px] px-4 py-32 md:px-8 lg:py-40">
            <div className="grid gap-16 lg:grid-cols-[1fr_1fr]">
              <div data-reveal>
                <p className="section-label">FAQ</p>
                <h2 className="mt-6 font-display text-[clamp(2rem,4.6vw,3rem)] font-normal leading-[1.06] tracking-[-0.025em] text-balance sm:text-[clamp(2.3rem,4.6vw,3.6rem)] md:text-[clamp(2.7rem,4.6vw,4.8rem)]">
                  The practical questions.
                </h2>
                <p className="mt-6 max-w-[480px] text-[16px] leading-7 text-[var(--ink-secondary)]">
                  Straight answers about portals, permissions, and how clients actually sign in.
                </p>
              </div>
              <FaqAccordion faqs={faqs} />
            </div>
          </section>
        </div>

        <div className="bg-[var(--gold-wash)]">
          <section className="mx-auto max-w-[1280px] px-4 py-32 md:px-8 lg:py-44">
            <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr]">
              <div data-reveal>
                <h2 className="max-w-[700px] font-display text-[clamp(2.2rem,5vw,3.8rem)] font-normal leading-[1.04] tracking-[-0.02em]">
                  Give every client a <DoodleWord variant="highlight">room worth entering.</DoodleWord>
                </h2>
                <p className="mt-8 max-w-[580px] text-[16px] leading-7 text-[var(--ink-secondary)]">
                  Take the tour, then create the first workspace your clients will remember for the right reasons.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 text-center lg:items-end lg:text-right" data-reveal data-delay={80}>
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
                <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-[var(--ink-tertiary)]">
                  Built for creative agencies &middot; By{" "}
                  <a
                    className="text-[var(--gold-core)] transition-colors hover:text-[var(--gold-mid)]"
                    href="https://velocityai.me"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Velocity AI
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-void)]">
        <div className="mx-auto max-w-[1280px] px-4 py-20 md:px-8">
          <div className="grid gap-12 md:grid-cols-[2.5fr_1fr_1fr_1fr]">
            <div>
              <Link className="font-display text-[32px] font-normal tracking-[-0.01em] text-[var(--gold-core)] transition-colors hover:text-[var(--gold-mid)]" href="/">
                PortalOS
              </Link>
              <div className="mt-4 h-px w-20 bg-[var(--gold-muted)]" />
              <p className="mt-6 max-w-[320px] text-[10px] uppercase tracking-[0.18em] text-[var(--ink-tertiary)]">
                A private operating system for agency client work.
              </p>
              <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-tertiary)]">
                By{" "}
                <a
                  className="text-[var(--gold-core)] transition-colors hover:text-[var(--gold-mid)]"
                  href="https://velocityai.me"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Velocity AI
                </a>
              </p>
            </div>
            <div>
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Product</p>
              <div className="mt-5 space-y-2.5">
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="#features">Features</Link>
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="#fit">Fit</Link>
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="#demo">Demo</Link>
              </div>
            </div>
            <div>
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Access</p>
              <div className="mt-5 space-y-2.5">
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="/login">Sign in</Link>
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="/onboarding">Get started</Link>
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="/demo/agency">Agency tour</Link>
              </div>
            </div>
            <div>
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Legal</p>
              <div className="mt-5 space-y-2.5">
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="/legal/privacy">Privacy policy</Link>
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="/legal/terms">Terms of service</Link>
                <p className="text-[14px] text-[var(--ink-tertiary)]">Security review available</p>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border-hairline)] pt-8 text-[13px] text-[var(--ink-tertiary)] sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} PortalOS. By{" "}
              <a
                className="text-[var(--gold-core)] transition-colors hover:text-[var(--gold-mid)]"
                href="https://velocityai.me"
                rel="noopener noreferrer"
                target="_blank"
              >
                Velocity AI
              </a>
            </p>
            <p className="font-mono uppercase tracking-[0.08em]">PortalOS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
