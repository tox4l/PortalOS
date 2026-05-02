import Link from "next/link";
import { ArrowUpRight, CalendarBlank, CheckCircle, Plus, Rows, UserCircle } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const projects = [
  {
    id: "dev-proj-001",
    name: "Brand Identity Refresh",
    client: "Northstar Branding",
    status: "In Review",
    badge: "review" as const,
    due: "Due in 11 days",
    owner: "Sarah Kim",
    progress: 58,
    tasks: "7 of 12 complete"
  },
  {
    id: "dev-proj-002",
    name: "Website Copy",
    client: "Northstar Branding",
    status: "Active",
    badge: "active" as const,
    due: "Due in 22 days",
    owner: "Marcus Reed",
    progress: 38,
    tasks: "2 of 6 complete"
  },
  {
    id: "dev-proj-003",
    name: "Q4 Campaign",
    client: "Forge Studio",
    status: "Active",
    badge: "active" as const,
    due: "Due in 16 days",
    owner: "Priya Nair",
    progress: 64,
    tasks: "3 of 4 complete"
  },
  {
    id: "dev-proj-004",
    name: "Retail Packaging Launch",
    client: "Vessel Co.",
    status: "Complete",
    badge: "approved" as const,
    due: "Completed 18 days ago",
    owner: "Priya Nair",
    progress: 100,
    tasks: "All tasks complete"
  }
];

const metrics = [
  ["Active", "3"],
  ["In review", "1"],
  ["Due this week", "4"],
  ["Complete", "1"]
];

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <section className="surface-panel p-6 md:p-8" data-reveal>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <p className="section-label">Project rooms</p>
            <h2 className="mt-7 max-w-[820px] font-display text-[clamp(3rem,5vw,5.5rem)] font-normal leading-[0.98] tracking-[-0.025em] text-[var(--ink-primary)] text-balance">
              Work in motion, without the theater.
            </h2>
            <p className="mt-6 max-w-[620px] text-[0.9375rem] leading-7 text-[var(--ink-secondary)]">
              Track the handoff from brief to approval while every file and comment stays attached to the room that produced it.
            </p>
          </div>

          <div className="grid content-end gap-3">
            <div className="surface-panel grid grid-cols-2 gap-px overflow-hidden bg-[var(--border-hairline)] p-0">
              {metrics.map(([label, value]) => (
                <div className="bg-[var(--bg-base)] p-4" key={label}>
                  <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">{label}</p>
                  <p className="mt-3 font-display text-[1.75rem] font-normal leading-none text-[var(--ink-primary)]">{value}</p>
                </div>
              ))}
            </div>
            <Button asChild className="mt-3">
              <Link href="/app/projects/new">
                <Plus aria-hidden="true" className="size-4" />
                New project
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="surface-panel overflow-hidden" data-reveal>
        <div className="grid grid-cols-[1.25fr_0.95fr_160px_110px] border-b border-[var(--border-hairline)] bg-[var(--bg-sunken)] px-5 py-3 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[var(--ink-tertiary)] max-lg:hidden">
          <span>Project</span>
          <span>Runway</span>
          <span>Owner</span>
          <span className="text-right">Open</span>
        </div>

        <div className="divide-y divide-[var(--border-hairline)]">
          {projects.map((project) => (
            <article
              className="workspace-row grid grid-cols-1 gap-5 p-5 lg:grid-cols-[1.25fr_0.95fr_160px_110px] lg:items-center"
              key={project.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-[1.5rem] font-normal leading-tight text-[var(--ink-primary)]">
                    {project.name}
                  </h3>
                  <Badge variant={project.badge}>{project.status}</Badge>
                </div>
                <p className="mt-1 text-[0.875rem] text-[var(--ink-secondary)]">{project.client}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-[0.625rem] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                  <span>{project.tasks}</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg-sunken)]">
                  <div
                    className="h-full rounded-full bg-[var(--gold-core)] transition-[width] duration-[var(--t-slow)] ease-[var(--ease-out)]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p className="inline-flex items-center gap-2 text-[0.8125rem] text-[var(--ink-secondary)]">
                  <CalendarBlank aria-hidden="true" className="size-4 text-[var(--ink-tertiary)]" />
                  {project.due}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-[0.8125rem] text-[var(--ink-secondary)] lg:block">
                <span className="inline-flex items-center gap-2">
                  <UserCircle aria-hidden="true" className="size-4 text-[var(--ink-tertiary)]" />
                  {project.owner}
                </span>
                <span className="inline-flex items-center gap-2 lg:mt-2">
                  <Rows aria-hidden="true" className="size-4 text-[var(--ink-tertiary)]" />
                  Board ready
                </span>
              </div>

              <div className="flex justify-start lg:justify-end">
                <Button asChild variant="ghost">
                  <Link href={`/app/projects/${project.id}`}>
                    Open workspace
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-panel p-6" data-reveal>
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
          <div>
            <p className="flex items-center gap-2 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-[var(--ink-tertiary)]">
              <CheckCircle aria-hidden="true" className="size-4" weight="duotone" />
              Project workspace
            </p>
            <h3 className="mt-3 max-w-[760px] font-display text-[1.875rem] font-normal leading-tight text-[var(--ink-primary)]">
              Kanban, briefs, deliverables, and comments now live behind each room.
            </h3>
          </div>
          <Button asChild variant="secondary">
            <Link href="/app/projects/new">Create project</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
