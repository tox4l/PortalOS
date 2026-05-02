import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, FileText, Rows } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  isDevBypass,
  getDevPortalClient,
  getDevPortalProjects,
  getDevPortalActivity
} from "@/lib/dev-bypass";

type PortalHomeProps = {
  params: Promise<{ clientSlug: string }>;
};

const statusBadgeVariant: Record<string, "active" | "review" | "draft" | "archived" | undefined> = {
  ACTIVE: "active",
  IN_REVIEW: "review",
  COMPLETE: "active",
  DRAFT: "draft",
  ARCHIVED: "archived"
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  IN_REVIEW: "In Review",
  DRAFT: "Draft",
  COMPLETE: "Complete",
  ARCHIVED: "Archived"
};

export default async function PortalHomePage({ params }: PortalHomeProps) {
  const { clientSlug } = await params;

  let clientName = "Northstar Brand";
  let welcomeMessage = "Here's where your projects stand today.";
  let projects: ReturnType<typeof getDevPortalProjects> = [];
  let activity: ReturnType<typeof getDevPortalActivity> = [];

  if (isDevBypass()) {
    const client = getDevPortalClient(clientSlug);
    if (!client) {
      notFound();
    }

    clientName = client.companyName;
    welcomeMessage = client.welcomeMessage;
    projects = getDevPortalProjects();
    activity = getDevPortalActivity();
  }

  const pendingReviewCount = projects.reduce((total, project) => total + project.pendingItems, 0);

  return (
    <div className="space-y-24">
      {/* Welcome */}
      <section data-reveal>
        <p className="section-label">Client portal</p>
        <h1 className="mt-6 max-w-[820px] font-display text-[clamp(3rem,6vw,5.75rem)] font-normal leading-[0.94] tracking-[-0.03em] text-[var(--ink-primary)] text-balance">
          Welcome back, {clientName}.
        </h1>
        <p className="mt-6 max-w-[640px] text-[18px] leading-[1.75] text-[var(--ink-secondary)]">
          {welcomeMessage || "Here's where your projects stand today."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <div className="surface-panel inline-flex flex-col gap-3 p-6 min-w-[160px]">
            <p className="font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--ink-tertiary)]">
              Active
            </p>
            <p className="font-display text-[48px] leading-none text-[var(--ink-primary)]">
              {projects.length}
            </p>
          </div>
          <div className="surface-panel inline-flex flex-col gap-3 border-[var(--border-gold-dim)] bg-[var(--gold-wash)] p-6 min-w-[160px]">
            <p className="font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--gold-core)]">
              In review
            </p>
            <p className="font-display text-[48px] leading-none text-[var(--gold-mid)]">
              {pendingReviewCount}
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section data-reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[40px] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--ink-primary)]">
              Projects
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-[var(--ink-secondary)]">
              Clear status, files, approvals, and comments for each active engagement.
            </p>
          </div>
          {activity.length > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/portal/${clientSlug}/activity`}>
                <Rows aria-hidden="true" className="size-4" />
                Activity
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              className="group surface-panel surface-panel-interactive block p-7"
              href={`/portal/${clientSlug}/projects/${project.id}`}
              key={project.id}
            >
              <div className="flex items-start justify-between gap-3">
                <Badge variant={statusBadgeVariant[project.status] ?? "draft"}>
                  {statusLabels[project.status] ?? project.status}
                </Badge>
                <ArrowRight
                  aria-hidden="true"
                  className="size-5 shrink-0 text-[var(--ink-tertiary)] transition-[color,transform] duration-[200ms] ease-[var(--ease-out)] group-hover:translate-x-1 group-hover:text-[var(--gold-core)]"
                  weight="bold"
                />
              </div>

              <h3 className="mt-5 font-display text-[28px] font-normal leading-[1.15] tracking-[-0.01em] text-[var(--ink-primary)] transition-colors duration-[200ms] ease-[var(--ease-out)] group-hover:text-[var(--gold-core)]">
                {project.name}
              </h3>
              <p className="mt-3 line-clamp-2 text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
                {project.description}
              </p>

              <div className="mt-6">
                <div className="flex items-center justify-between text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">
                  <span>Progress</span>
                  <span className="font-sans font-semibold text-[var(--gold-core)]">{project.progress}%</span>
                </div>
                <div className="mt-2.5 h-2 rounded-full bg-[var(--bg-sunken)]">
                  <div className="h-full rounded-full bg-[var(--gold-mid)] transition-[width] duration-500 ease-[var(--ease-out)]" style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-[13px] text-[var(--ink-secondary)]">
                <span className="inline-flex items-center gap-2">
                  <Clock aria-hidden="true" className="size-4 text-[var(--ink-tertiary)]" />
                  {project.lastUpdate}
                </span>
                {project.pendingItems > 0 && (
                  <span className="inline-flex items-center gap-2 font-medium text-[var(--gold-core)]">
                    <FileText aria-hidden="true" className="size-4" />
                    {project.pendingItems} awaiting review
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity preview */}
      {activity.length > 0 && (
        <section data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
            <div>
              <h2 className="font-display text-[36px] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--ink-primary)]">
                Recent activity
              </h2>
              <p className="mt-2 text-[15px] leading-6 text-[var(--ink-secondary)]">
                What changed since you last looked.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/portal/${clientSlug}/activity`}>
                View all
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-3 divide-y divide-[var(--border-hairline)]">
            {activity.slice(0, 4).map((item, i) => (
              <div className="flex items-center gap-5 py-5" key={i}>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)] font-sans text-[13px] font-semibold text-[var(--gold-core)]">
                  {item.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] leading-6 text-[var(--ink-secondary)]">
                    <span className="font-semibold text-[var(--ink-primary)]">{item.actor}</span> {item.action}
                  </p>
                  <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
