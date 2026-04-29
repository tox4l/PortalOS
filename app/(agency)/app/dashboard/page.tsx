import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  ClockCountdown,
  FileDashed,
  FolderSimpleDashed,
  Lightning,
  Timer
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountUpNumber } from "@/components/agency/count-up-number";

const stats = [
  {
    label: "Active projects",
    value: 7,
    suffix: "",
    note: "+18.4% this month",
    icon: Lightning,
    tone: "review" as const
  },
  {
    label: "Files in motion",
    value: 18,
    suffix: "",
    note: "6 client-facing",
    icon: FolderSimpleDashed,
    tone: "approved" as const
  },
  {
    label: "Pending approvals",
    value: 5,
    suffix: "",
    note: "2 waiting today",
    icon: CheckCircle,
    tone: "review" as const
  },
  {
    label: "Tasks due",
    value: 14,
    suffix: "",
    note: "4 urgent",
    icon: ClockCountdown,
    tone: "overdue" as const
  }
];

const activities = [
  {
    actor: "Iris Calloway",
    action: "commented on the identity deck",
    time: "Today, 10:42",
    initials: "IC",
    kind: "Client"
  },
  {
    actor: "Sarah Kim",
    action: "uploaded identity-presentation-v2.pdf",
    time: "Yesterday, 17:18",
    initials: "SK",
    kind: "Team"
  },
  {
    actor: "Theo Watanabe",
    action: "approved the Q4 concept board",
    time: "3 days ago",
    initials: "TW",
    kind: "Client"
  },
  {
    actor: "Priya Nair",
    action: "moved Q4 Concept Board into review",
    time: "5 days ago",
    initials: "PN",
    kind: "Team"
  }
];

const projects = [
  {
    name: "Brand Identity Refresh",
    client: "Northstar Brand",
    status: "In Review",
    progress: 58,
    due: "Due in 11 days",
    badge: "review" as const
  },
  {
    name: "Website Copy",
    client: "Northstar Brand",
    status: "Active",
    progress: 38,
    due: "Due in 22 days",
    badge: "active" as const
  },
  {
    name: "Q4 Campaign",
    client: "Forge Studio",
    status: "Active",
    progress: 64,
    due: "Due in 16 days",
    badge: "active" as const
  }
];

const approvals = [
  {
    title: "Identity Presentation Deck",
    client: "Northstar Brand",
    waiting: "2 days waiting"
  },
  {
    title: "Website Copy Deck",
    client: "Northstar Brand",
    waiting: "6 days waiting"
  },
  {
    title: "Q4 Concept Board",
    client: "Forge Studio",
    waiting: "1 day waiting"
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="lux-panel overflow-hidden p-6 md:p-8" data-reveal>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <p className="section-label">Agency command</p>
              <h2 className="mt-7 max-w-[760px] font-display text-[clamp(3rem,5vw,5.8rem)] font-normal leading-[0.98] tracking-[-0.025em] text-[var(--ink-primary)] text-balance">
                Tonight is already sorted.
              </h2>
              <p className="mt-7 max-w-[560px] text-[16px] leading-7 text-[var(--ink-secondary)]">
                Seven client rooms, five review decisions, and a delivery queue that needs a careful hand.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Briefs moving", "Files waiting", "Reviews watched"].map((label, index) => (
                <div
                  className="border-t border-[var(--border-default)] pt-4"
                  data-delay={index * 70}
                  data-reveal
                  key={label}
                >
                  <p className="lux-meta">{label}</p>
                  <p className="mt-3 font-mono text-[24px] leading-none text-[var(--ink-primary)]">
                    {["03", "05", "02"][index]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-sunken)] p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="lux-meta">Priority signal</p>
              <Badge variant="review">Live</Badge>
            </div>
            <div className="mt-8">
              <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                Next review event
              </p>
              <p className="mt-3 lux-amount text-[52px] leading-none tracking-[-0.04em]">
                05
              </p>
              <p className="mt-4 text-[14px] leading-6 text-[var(--ink-secondary)]">
                Northstar has five items waiting across two project rooms. Clear the approval deck before the next client check-in.
              </p>
            </div>
            <div className="mt-8 divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
              {[
                ["Review deck", "Waiting 2d"],
                ["Client thread", "Last reply 10:42"],
                ["Review reminder", "Hold until deck clears"]
              ].map(([label, value]) => (
                <div className="flex items-center justify-between gap-4 py-3" key={label}>
                  <span className="text-[13px] text-[var(--ink-secondary)]">{label}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <Button asChild className="mt-6 w-full" variant="secondary">
              <Link href="/app/projects/dev-proj-001">
                Open command room
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </aside>
        </div>
      </section>

      <section className="lux-panel grid grid-cols-1 divide-y divide-[var(--border-default)] md:grid-cols-4 md:divide-x md:divide-y-0" data-reveal>
        {stats.map((stat, index) => (
          <div className="p-5" data-delay={index * 60} data-reveal key={stat.label}>
            <div className="flex items-center justify-between gap-4">
              <p className="lux-meta">{stat.label}</p>
              <stat.icon aria-hidden="true" className="size-4 text-[var(--gold-muted)]" weight="duotone" />
            </div>
            <div className="mt-6">
              <CountUpNumber
                className="font-mono text-[42px] font-normal leading-none tracking-[-0.04em] text-[var(--ink-primary)]"
                suffix={stat.suffix}
                value={stat.value}
              />
              <div className="mt-4">
                <Badge variant={stat.tone}>{stat.note}</Badge>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className="lux-panel" data-reveal>
          <div className="flex flex-col gap-4 border-b border-[var(--border-default)] p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-[32px] font-normal leading-tight text-[var(--ink-primary)]">
                Delivery runway
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">
                The next three client commitments, ordered by the decisions they need.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/app/projects">
                View all
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {projects.map((project) => (
              <article
                className="grid grid-cols-1 gap-5 p-5 transition-[background-color,border-color] duration-200 hover:bg-[rgba(255,255,255,0.025)] md:grid-cols-[minmax(0,1fr)_150px_170px]"
                key={project.name}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-2xl font-normal leading-tight text-[var(--ink-primary)]">
                      {project.name}
                    </h3>
                    <Badge variant={project.badge}>{project.status}</Badge>
                  </div>
                  <p className="mt-1 text-[14px] text-[var(--ink-secondary)]">{project.client}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-sunken)]">
                    <div
                      className="h-full rounded-full bg-[var(--gold-core)]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <p className="flex items-center gap-2 text-[13px] text-[var(--ink-tertiary)] md:justify-end">
                  <Timer aria-hidden="true" className="size-4" />
                  {project.due}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="lux-panel p-5" data-delay={90} data-reveal>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-[30px] font-normal leading-tight text-[var(--ink-primary)]">
                Approval queue
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">
                Review items that can block delivery.
              </p>
            </div>
            <FileDashed aria-hidden="true" className="size-5 text-[var(--gold-muted)]" weight="duotone" />
          </div>
          <div className="mt-5 space-y-3">
            {approvals.map((approval) => (
              <div
                className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] p-4"
                key={approval.title}
              >
                <p className="font-medium text-[var(--ink-primary)]">{approval.title}</p>
                <p className="mt-1 text-[13px] text-[var(--ink-secondary)]">{approval.client}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-[12px] text-[var(--ink-tertiary)]">
                    <Timer aria-hidden="true" className="size-4" />
                    {approval.waiting}
                  </p>
                  <Button size="sm" variant="ghost">
                    Remind
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,430px)_1fr]">
        <div className="lux-panel p-6" data-reveal>
          <h2 className="font-display text-[30px] font-normal leading-tight text-[var(--ink-primary)]">
            Recent activity
          </h2>
          <p className="mt-2 text-[14px] text-[var(--ink-secondary)]">
            The workroom pulse from clients and team members.
          </p>
          <div className="relative mt-7 space-y-5 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-[var(--border-default)]">
            {activities.map((activity) => (
              <div className="relative flex gap-3" key={`${activity.actor}-${activity.action}`}>
                <div className="z-[1] flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[12px] font-medium text-[var(--ink-primary)]">
                  {activity.initials}
                </div>
                <div className="min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-medium text-[var(--ink-primary)]">{activity.actor}</p>
                    <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--ink-tertiary)]">
                      {activity.kind}
                    </span>
                  </div>
                  <p className="text-[14px] leading-6 text-[var(--ink-secondary)]">{activity.action}</p>
                  <p className="text-[11px] uppercase tracking-[0.05em] text-[var(--ink-tertiary)]">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lux-panel p-6" data-delay={90} data-reveal>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--gold-core)]">
                <FolderSimpleDashed aria-hidden="true" className="size-4" weight="duotone" />
                Delivery focus
              </p>
              <p className="mt-5 lux-amount text-[56px] leading-none tracking-[-0.04em]">
                11d
              </p>
              <h2 className="mt-6 max-w-[620px] font-display text-[34px] font-normal leading-tight text-[var(--ink-primary)]">
                Review attention without the chase.
              </h2>
              <p className="mt-3 max-w-[560px] text-[14px] leading-6 text-[var(--ink-secondary)]">
                Brand Identity Refresh is due in 11 days. Keep the reminder tied to the deck, files, and client thread.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/app/projects/dev-proj-001">Open project</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
