import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Buildings,
  CaretDown,
  ChatCircleText,
  Check,
  FileText,
  FolderSimpleDashed,
  Rows,
  ShieldCheck,
  Sparkle,
  Star
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/marketing/landing-hero";
import { FloatingPanelsSceneLoader } from "@/components/marketing/floating-panels-scene-loader";

const proofNames = [
  "Northstar Branding",
  "Forge Studio",
  "Vessel Co.",
  "Apex Creative",
  "Lumina Creative",
  "Morrow House",
  "Atlas Bureau",
  "Kanso Office"
];

const painPoints = [
  {
    icon: ChatCircleText,
    title: "Feedback lives in too many places",
    description:
      "Client comments, internal notes, files, and approvals get scattered across inboxes and shared folders."
  },
  {
    icon: FileText,
    title: "Project context disappears",
    description:
      "The brief, latest deck, and decision history rarely sit beside the conversation that explains them."
  },
  {
    icon: FolderSimpleDashed,
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
    description: "Step into the command side with dashboard, projects, clients, and the full workspace.",
    href: "/demo/agency",
    icon: Rows,
    cta: "Try agency view",
    stats: ["7 active projects", "5 approvals", "14 tasks due"]
  },
  {
    title: "Client view",
    description: "See the branded portal your clients use for files, approvals, and comments.",
    href: "/demo/client",
    icon: ShieldCheck,
    cta: "Try client view",
    stats: ["Private room", "Magic link", "Review ready"]
  }
];

const testimonials = [
  {
    quote:
      "PortalOS gave our clients one place to approve, comment, and understand the work. The room feels premium enough to send to our best accounts.",
    author: "Iris Calloway",
    role: "Creative Director, Northstar Branding"
  },
  {
    quote:
      "The brief and deliverable history finally sit beside the client conversation. Our kickoff calls got shorter and cleaner.",
    author: "Marcus Reed",
    role: "Strategy Lead, Forge Studio"
  },
  {
    quote:
      "Final delivery stopped feeling like an awkward separate thread. Clients review the work from the same place they followed the whole project.",
    author: "Priya Nair",
    role: "Operations, Vessel Co."
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
    q: "Is there a trial?",
    a: "Yes. The demo data remains available for exploring the full workflow."
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--bg-void)] text-[var(--ink-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border-default)] bg-[rgba(10,10,11,0.86)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link className="font-display text-2xl font-normal tracking-[-0.01em] text-[var(--gold-400)]" href="/">
            PortalOS
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] font-medium text-[var(--ink-tertiary)] md:flex" aria-label="Marketing navigation">
            <Link className="transition-colors hover:text-[var(--ink-secondary)]" href="#platform">Platform</Link>
            <Link className="transition-colors hover:text-[var(--ink-secondary)]" href="#features">Features</Link>
            <Link className="transition-colors hover:text-[var(--ink-secondary)]" href="#fit">Fit</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/onboarding">Start trial</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-full overflow-x-hidden">
        <LandingHero />

        <section className="mx-auto grid max-w-[1280px] gap-10 px-4 py-28 md:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center" id="platform">
          <div data-reveal>
            <p className="section-label">The product</p>
            <h2 className="mt-7 max-w-[680px] font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.02] tracking-[-0.025em] text-[var(--ink-primary)] text-balance sm:text-[clamp(2.4rem,5vw,4rem)] md:text-[clamp(2.8rem,5vw,5.2rem)]">
              Client work, arranged like a private operating room.
            </h2>
            <p className="mt-7 max-w-[580px] text-[16px] leading-7 text-[var(--ink-secondary)]">
              PortalOS gives agencies one disciplined surface for the entire engagement, from the first brief to the final handoff.
            </p>
            <div className="mt-8 grid max-w-[560px] grid-cols-3 gap-px overflow-hidden rounded-[10px] border border-[var(--border-default)] bg-[var(--border-default)]">
              {[
                ["Projects", "07"],
                ["Reviews", "05"],
                ["Due", "14"]
              ].map(([label, value]) => (
                <div className="bg-[var(--bg-base)] p-4" key={label}>
                  <p className="lux-meta">{label}</p>
                  <p className="mt-3 font-mono text-[24px] leading-none text-[var(--ink-primary)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div data-delay={90} data-reveal>
            <FloatingPanelsSceneLoader />
          </div>
        </section>

        <section className="border-y border-[var(--border-default)] bg-[var(--bg-base)] py-8" id="proof">
          <div className="mx-auto max-w-[1280px] overflow-hidden px-4 md:px-8">
            <div className="flex items-center gap-8">
              <p className="lux-meta shrink-0 text-[var(--gold-core)]">Trusted by refined studios</p>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="marquee-track flex w-max gap-10">
                  {[...proofNames, ...proofNames].map((name, index) => (
                    <span className="text-[15px] font-medium text-[var(--ink-secondary)] opacity-70" key={`${name}-${index}`}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 py-32 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-28" data-reveal>
              <p className="section-label">The problem</p>
              <h2 className="mt-7 font-display text-[clamp(1.9rem,4.6vw,3rem)] font-normal leading-[1.04] tracking-[-0.025em] text-balance sm:text-[clamp(2.3rem,4.6vw,3.6rem)] md:text-[clamp(2.6rem,4.6vw,4.8rem)]">
                The work is good. The delivery room is usually the weak part.
              </h2>
            </div>
            <div className="grid gap-4">
              {painPoints.map((point, index) => (
                <article className="lux-panel p-6" data-delay={index * 80} data-reveal key={point.title}>
                  <div className="flex gap-5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)]">
                      <point.icon aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="font-display text-[26px] font-normal leading-tight text-[var(--ink-primary)]">
                        {point.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-7 text-[var(--ink-secondary)]">{point.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border-default)] bg-[var(--bg-base)] py-32" id="features">
          <div className="mx-auto max-w-[1280px] px-4 md:px-8">
            <div className="max-w-[760px]" data-reveal>
              <p className="section-label">Features</p>
              <h2 className="mt-7 font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance sm:text-[clamp(2.4rem,5vw,4rem)] md:text-[clamp(2.8rem,5vw,5.2rem)]">
                Built for the invisible work that makes clients trust you.
              </h2>
            </div>

            <div className="mt-18 grid gap-16">
              {featureRows.map((feature, index) => (
                <article
                  className="grid gap-8 lg:grid-cols-2 lg:items-center"
                  data-delay={index * 80}
                  data-reveal
                  key={feature.title}
                >
                  <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
                    <p className="lux-meta text-[var(--gold-core)]">{feature.eyebrow}</p>
                    <h3 className="mt-5 max-w-[620px] font-display text-[clamp(1.7rem,4.5vw,2.8rem)] font-normal leading-[1.08] tracking-[-0.015em] text-[var(--ink-primary)] sm:text-[clamp(2rem,4.5vw,40px)]">
                      {feature.title}
                    </h3>
                    <p className="mt-5 max-w-[560px] text-[15px] leading-7 text-[var(--ink-secondary)]">
                      {feature.description}
                    </p>
                    <ul className="mt-6 grid gap-3">
                      {feature.bullets.map((bullet) => (
                        <li className="flex items-center gap-3 text-[14px] text-[var(--ink-secondary)]" key={bullet}>
                          <Check aria-hidden="true" className="size-4 shrink-0 text-[var(--gold-400)]" weight="bold" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="lux-panel min-h-[340px] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex size-12 items-center justify-center rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)]">
                        <feature.icon aria-hidden="true" className="size-5 text-[var(--gold-core)]" weight="duotone" />
                      </div>
                      <div className="text-right">
                        <p className="lux-amount text-[32px] leading-none">{feature.metric}</p>
                        <p className="mt-1 lux-meta">{feature.statLabel}</p>
                      </div>
                    </div>
                    <div className="mt-10 grid gap-3">
                      {feature.bullets.map((bullet, bulletIndex) => (
                        <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] p-4" key={bullet}>
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
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 py-32 md:px-8" id="demo">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div data-reveal>
              <p className="section-label">Demo rooms</p>
              <h2 className="mt-7 font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance sm:text-[clamp(2.4rem,5vw,4rem)] md:text-[clamp(2.8rem,5vw,5.2rem)]">
                Try both sides of the room.
              </h2>
              <p className="mt-7 max-w-[560px] text-[16px] leading-7 text-[var(--ink-secondary)]">
                The showroom is already loaded with projects, comments, deliverables, and client activity.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {demoCards.map((card, index) => (
                <article
                  className={`lux-panel lux-panel-interactive p-6 ${index === 1 ? "md:translate-y-8" : ""}`}
                  data-delay={index * 80}
                  data-reveal
                  key={card.title}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)]">
                      <card.icon aria-hidden="true" className="size-5 text-[var(--gold-core)]" weight="duotone" />
                    </div>
                    <Badge variant={index === 0 ? "review" : "approved"}>{index === 0 ? "Team" : "Client"}</Badge>
                  </div>
                  <h3 className="mt-8 font-display text-[30px] font-normal leading-tight text-[var(--ink-primary)]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-6 text-[var(--ink-secondary)]">{card.description}</p>
                  <div className="mt-6 divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
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
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border-default)] bg-[var(--bg-base)] py-32">
          <div className="mx-auto max-w-[1280px] px-4 md:px-8">
            <div className="max-w-[760px]" data-reveal>
              <p className="section-label">Testimonials</p>
              <h2 className="mt-7 font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance sm:text-[clamp(2.4rem,5vw,4rem)] md:text-[clamp(2.8rem,5vw,5.2rem)]">
                Agencies remember how the handoff feels.
              </h2>
            </div>
            <div className="mt-16 grid gap-5 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <article className="lux-panel p-6" data-delay={index * 80} data-reveal key={testimonial.author}>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star aria-hidden="true" className="size-4 text-[var(--gold-400)]" key={starIndex} weight="fill" />
                    ))}
                  </div>
                  <blockquote className="mt-6 text-[16px] leading-8 text-[var(--ink-secondary)]">
                    {testimonial.quote}
                  </blockquote>
                  <div className="mt-8 border-t border-[var(--border-default)] pt-5">
                    <p className="font-medium text-[var(--ink-primary)]">{testimonial.author}</p>
                    <p className="mt-1 text-[13px] text-[var(--ink-tertiary)]">{testimonial.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 py-32 md:px-8" id="fit">
          <div className="mx-auto max-w-[700px] text-center" data-reveal>
            <p className="section-label justify-center">Fit</p>
            <h2 className="mt-7 font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance sm:text-[clamp(2.4rem,5vw,4rem)] md:text-[clamp(2.8rem,5vw,5.2rem)]">
              Start focused. Keep the room.
            </h2>
            <p className="mt-6 text-[16px] leading-7 text-[var(--ink-secondary)]">
              Pick the operating shape that matches your studio. This build focuses on project operations only.
            </p>
          </div>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {workspaceShapes.map((shape, index) => (
              <article
                className={`lux-panel p-6 ${shape.highlighted ? "border-[var(--border-gold)] shadow-[var(--glow-gold-inset),var(--shadow-md)]" : ""}`}
                data-delay={index * 80}
                data-reveal
                key={shape.name}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-[28px] font-normal text-[var(--ink-primary)]">{shape.name}</h3>
                  {shape.highlighted ? <Badge variant="review">Most chosen</Badge> : null}
                </div>
                <p className="mt-3 min-h-12 text-[14px] leading-6 text-[var(--ink-secondary)]">{shape.description}</p>
                <ul className="mt-7 space-y-3">
                  {shape.features.map((feature) => (
                    <li className="flex items-center gap-3 text-[14px] text-[var(--ink-secondary)]" key={feature}>
                      <Check aria-hidden="true" className="size-4 shrink-0 text-[var(--gold-400)]" weight="bold" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 w-full" variant={shape.highlighted ? undefined : "secondary"}>
                  <Link href="/onboarding">{shape.highlighted ? "Open showroom" : "Start setup"}</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--border-default)] bg-[var(--bg-base)] py-32">
          <div className="mx-auto grid max-w-[1280px] gap-12 px-4 md:px-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div data-reveal>
              <p className="section-label">FAQ</p>
              <h2 className="mt-7 font-display text-[clamp(2rem,4.6vw,3rem)] font-normal leading-[1.04] tracking-[-0.025em] text-balance sm:text-[clamp(2.3rem,4.6vw,3.6rem)] md:text-[clamp(2.7rem,4.6vw,4.8rem)]">
                The practical questions.
              </h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details className="lux-panel group" data-delay={index * 50} data-reveal key={faq.q}>
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-[15px] font-medium text-[var(--ink-primary)] marker:hidden">
                    {faq.q}
                    <CaretDown
                      aria-hidden="true"
                      className="size-4 shrink-0 text-[var(--ink-tertiary)] transition-transform group-open:rotate-180"
                      weight="bold"
                    />
                  </summary>
                  <p className="border-t border-[var(--border-default)] px-6 py-5 text-[15px] leading-7 text-[var(--ink-secondary)]">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 py-32 md:px-8">
          <div className="lux-panel overflow-hidden p-8 text-center md:p-12" data-reveal>
            <Sparkle aria-hidden="true" className="mx-auto size-6 text-[var(--gold-400)]" weight="duotone" />
            <h2 className="mx-auto mt-6 max-w-[760px] font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance sm:text-[clamp(2.4rem,5vw,4rem)] md:text-[clamp(2.8rem,5vw,5.4rem)]">
              Give every client a room worth entering.
            </h2>
            <p className="mx-auto mt-6 max-w-[620px] text-[16px] leading-7 text-[var(--ink-secondary)]">
              Start with the demo, then create the first workspace your clients will remember for the right reasons.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/onboarding">
                  Start free trial
                  <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/demo/client">Open client demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-default)] bg-[var(--bg-void)]">
        <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <p className="font-display text-2xl font-normal tracking-[-0.01em] text-[var(--gold-400)]">
                PortalOS
              </p>
              <p className="mt-4 max-w-[300px] text-[14px] leading-6 text-[var(--ink-tertiary)]">
                A private operating system for agency client work.
              </p>
            </div>
            <div>
              <p className="lux-meta">Product</p>
              <div className="mt-4 space-y-2">
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="#features">Features</Link>
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="#fit">Fit</Link>
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="#demo">Demo</Link>
              </div>
            </div>
            <div>
              <p className="lux-meta">Access</p>
              <div className="mt-4 space-y-2">
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="/login">Sign in</Link>
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="/onboarding">Start trial</Link>
                <Link className="block text-[14px] text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]" href="/demo/agency">Agency demo</Link>
              </div>
            </div>
            <div>
              <p className="lux-meta">Legal</p>
              <div className="mt-4 space-y-2 text-[14px] text-[var(--ink-tertiary)]">
                <p>Privacy available on request</p>
                <p>Terms available on request</p>
                <p>Security review available</p>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border-default)] pt-8 text-[13px] text-[var(--ink-tertiary)] sm:flex-row sm:items-center sm:justify-between">
            <p>2026 PortalOS. Built for creative agencies.</p>
            <p className="font-mono uppercase tracking-[0.08em]">Obsidian and Gold</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
