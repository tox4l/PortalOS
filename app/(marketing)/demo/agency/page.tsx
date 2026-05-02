import Link from "next/link";
import {
  ArrowRight,
  Buildings,
  ChatCenteredDots,
  CheckCircle,
  ClockCountdown,
  FileDashed,
  FolderSimpleDashed,
  Lightning,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ScrollAwareHeader } from "@/components/shared/scroll-aware-header";

const walkthroughStats = [
  {
    label: "Active projects",
    description: "Each client engagement gets its own project room with boards, briefs, and files — all visible here at a glance.",
    icon: Lightning,
  },
  {
    label: "Files in motion",
    description: "Every deliverable, version, and shared file is tracked per project. You'll see what's client-facing and what's internal.",
    icon: FolderSimpleDashed,
  },
  {
    label: "Pending approvals",
    description: "When a client needs to review or approve a deliverable, it queues here so nothing slips through.",
    icon: CheckCircle,
  },
  {
    label: "Tasks due",
    description: "Deadlines, reminders, and priority signals surface here so your team always knows what's next.",
    icon: ClockCountdown,
  },
];

const walkthroughSections = [
  {
    icon: FolderSimpleDashed,
    title: "Your delivery runway",
    subtitle: "Projects",
    description:
      "Every client engagement lives in its own project room. From here you'll see progress bars, due dates, and the current status of each deliverable — agency side and client side, all in one place.",
    details: [
      "Kanban boards per project",
      "Brief and file history attached to every room",
      "Client-safe visibility — internal notes stay hidden",
    ],
  },
  {
    icon: FileDashed,
    title: "Your approval queue",
    subtitle: "Reviews",
    description:
      "When deliverables are ready for client review, they appear here. You'll see who's waiting, for how long, and can send reminders without leaving the room.",
    details: [
      "Clients approve or comment directly",
      "Version history keeps every iteration",
      "No more attachments lost in email threads",
    ],
  },
  {
    icon: ChatCenteredDots,
    title: "Your activity stream",
    subtitle: "Activity",
    description:
      "Every comment, file upload, approval, and status change is recorded here — a living timeline of each engagement. Your team and your clients share one source of truth.",
    details: [
      "Client comments stay in context",
      "Team updates visible to the right people",
      "Full decision history, always searchable",
    ],
  },
  {
    icon: Users,
    title: "Your team roster",
    subtitle: "Team",
    description:
      "Team members, their roles, and their active projects are all visible here. As your studio grows, your roster grows with it — permissions and visibility scale automatically.",
    details: [
      "Invite team members by email",
      "Role-based access per project",
      "Clients only see what you share",
    ],
  },
];

export default function AgencyDemoPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--bg-void)] text-[var(--ink-primary)]">
      <ScrollAwareHeader>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link
              className="font-display text-2xl font-normal tracking-[-0.01em] text-[var(--gold-core)]"
              href="/"
            >
              PortalOS
            </Link>
            <Badge variant="review">TOUR MODE</Badge>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/demo/client">Client view</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/onboarding">
                Start your agency
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </ScrollAwareHeader>

      <main className="mx-auto max-w-[1400px] space-y-10 px-4 py-8 md:px-8">
        {/* Hero */}
        <section className="surface-panel overflow-hidden p-6 md:p-10">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_440px]">
            <div className="flex flex-col justify-between gap-10">
              <div>
                <p className="section-label">Product tour</p>
                <h1 className="mt-6 max-w-[760px] font-display text-[clamp(2.6rem,5vw,5rem)] font-normal leading-[1.02] tracking-[-0.025em]">
                  This is your agency command center.
                </h1>
                <p className="mt-8 max-w-[600px] text-[16px] leading-7 text-[var(--ink-secondary)]">
                  Every section you see below is a real part of your future dashboard. Right now
                  they&apos;re empty — walk through each one to understand what goes where once your
                  client rooms are live.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {["Project rooms", "Client portals", "Review workflows"].map((label, index) => (
                  <div className="border-t border-[var(--border-hairline)] pt-4" key={label}>
                    <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">{label}</p>
                    <p className="mt-3 font-mono text-[24px] leading-none text-[var(--gold-core)]">
                      {["Unlimited", "Branded", "Streamlined"][index]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="surface-panel rounded-[8px] p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Your brand here</p>
                <Badge variant="review">Preview</Badge>
              </div>
              <div className="mt-8">
                <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                  Agency identity
                </p>
                <p className="mt-3 font-display text-[32px] leading-tight text-[var(--ink-primary)]">
                  Your Agency Name
                </p>
                <p className="mt-4 text-[14px] leading-6 text-[var(--ink-secondary)]">
                  This panel will show your agency brand, custom domain, and a live priority signal —
                  which projects need attention right now.
                </p>
              </div>
              <div className="mt-8 divide-y divide-[var(--border-hairline)] border-y border-[var(--border-hairline)]">
                {[
                  ["Custom domain", "yourname.portalos.app"],
                  ["Brand color", "Your accent color"],
                  ["Welcome message", "Set per client portal"],
                ].map(([label, value]) => (
                  <div className="flex items-center justify-between gap-4 py-3" key={label}>
                    <span className="text-[13px] text-[var(--ink-secondary)]">{label}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* Agency identity + team */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="surface-panel p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-[10px] bg-[var(--gold-dim)]">
                <Buildings aria-hidden="true" className="size-7 text-[var(--gold-core)]" weight="duotone" />
              </div>
              <div>
                <h3 className="font-display text-[28px] font-normal leading-tight">Your agency lives here</h3>
                <p className="mt-1 text-[14px] text-[var(--ink-secondary)]">yourname.portalos.app</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="active">Your plan tier</Badge>
                  <Badge variant="active">Your team count</Badge>
                  <Badge variant="active">Your active clients</Badge>
                </div>
                <p className="mt-4 text-[14px] leading-6 text-[var(--ink-tertiary)]">
                  Once you set up your agency, your brand name, domain, plan, team size, and client count
                  will appear here — giving you a quick snapshot of your operation.
                </p>
              </div>
            </div>
          </div>

          <div className="surface-panel p-5">
            <div className="flex items-center gap-2">
              <Users aria-hidden="true" className="size-4 text-[var(--gold-muted)]" weight="duotone" />
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">Your team</p>
            </div>
            <p className="mt-4 text-[14px] leading-6 text-[var(--ink-secondary)]">
              Team members you invite will be listed here with their roles. Each member gets
              permissions scoped to their projects — creative directors, designers, and strategists,
              all visible at a glance.
            </p>
            <div className="mt-5 space-y-2">
              {["Creative Director", "Design Lead", "Copy Lead", "Strategist"].map((role) => (
                <div className="flex items-center gap-3 rounded-[6px] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-base)] p-2.5" key={role}>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[11px] font-medium text-[var(--ink-tertiary)]">
                    —
                  </div>
                  <div>
                    <p className="text-[13px] text-[var(--ink-tertiary)]">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats walkthrough */}
        <section className="surface-panel grid grid-cols-1 divide-y divide-[var(--border-hairline)] md:grid-cols-4 md:divide-x md:divide-y-0">
          {walkthroughStats.map((stat) => (
            <div className="p-5" key={stat.label}>
              <div className="flex items-center justify-between gap-4">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">{stat.label}</p>
                <stat.icon aria-hidden="true" className="size-4 text-[var(--gold-muted)]" weight="duotone" />
              </div>
              <div className="mt-6">
                <p className="font-mono text-[42px] font-normal leading-none tracking-[-0.04em] text-[var(--gold-core)]">
                  —
                </p>
                <p className="mt-4 text-[13px] leading-6 text-[var(--ink-secondary)]">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Walkthrough sections */}
        <section className="space-y-6">
          {walkthroughSections.map((section, index) => (
            <div
              className="surface-panel grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_400px]"
              key={section.title}
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-base)]">
                    <section.icon aria-hidden="true" className="size-5 text-[var(--gold-core)]" weight="duotone" />
                  </div>
                  <div>
                    <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">
                      {section.subtitle}
                    </p>
                  </div>
                </div>
                <h2 className="mt-4 font-display text-[30px] font-normal leading-tight">
                  {section.title}
                </h2>
                <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-[var(--ink-secondary)]">
                  {section.description}
                </p>
                <ul className="mt-6 grid gap-2.5">
                  {section.details.map((detail) => (
                    <li className="flex items-center gap-3 text-[14px] text-[var(--ink-secondary)]" key={detail}>
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[var(--border-gold-dim)] bg-[var(--gold-dim)] text-[10px] text-[var(--gold-core)]">
                        ✓
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-base)] p-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-[var(--gold-dim)]">
                  <section.icon aria-hidden="true" className="size-7 text-[var(--gold-core)]" weight="duotone" />
                </div>
                <p className="mt-5 font-display text-[22px] font-normal text-[var(--ink-primary)]">
                  {section.subtitle} live here
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[var(--ink-tertiary)]">
                  Your {section.subtitle.toLowerCase()} will fill this space once you create your first
                  client room and start moving work through it.
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Bottom CTA */}
        <section className="py-16 text-center">
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-normal leading-[1.04]">
            Ready to fill these rooms?
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-7 text-[var(--ink-secondary)]">
            Every empty slot you see above becomes active the moment you set up your agency. Three
            minutes is all it takes.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button asChild size="sm">
              <Link href="/onboarding">
                Start setup
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/demo/client">See client view</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
