import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, FileText } from "@phosphor-icons/react/dist/ssr";
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
    <div className="space-y-8">
      <section className="lux-panel p-6 md:p-8" data-reveal>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <p className="section-label">Client portal</p>
            <h1 className="mt-7 max-w-[820px] font-display text-[clamp(3.25rem,6vw,6rem)] font-normal leading-[0.96] tracking-[-0.03em] text-[var(--ink-primary)] text-balance">
              Welcome back, {clientName}.
            </h1>
            <p className="mt-7 max-w-[620px] text-[16px] leading-7 text-[var(--ink-secondary)]">
              {welcomeMessage || "Here's where your projects stand today."}
            </p>
          </div>

          <aside className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-sunken)] p-5">
            <p className="lux-meta">Room status</p>
            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-[var(--border-default)] bg-[var(--border-default)]">
              <div className="bg-[var(--bg-base)] p-4">
                <p className="lux-meta">Active</p>
                <p className="mt-3 font-mono text-[34px] leading-none text-[var(--ink-primary)]">{projects.length}</p>
              </div>
              <div className="bg-[var(--gold-dim)] p-4">
                <p className="lux-meta text-[var(--gold-core)]">Review</p>
                <p className="mt-3 lux-amount text-[34px] leading-none">{pendingReviewCount}</p>
              </div>
            </div>
            <p className="mt-5 text-[14px] leading-6 text-[var(--ink-secondary)]">
              Every approval, file, and client note stays attached to the project where it belongs.
            </p>
          </aside>
        </div>
      </section>

      <section className="lux-panel overflow-hidden" data-reveal>
        <div className="border-b border-[var(--border-default)] p-6">
          <h2 className="font-display text-[32px] font-normal leading-tight text-[var(--ink-primary)]">
            Projects
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">
            Clear status, files, approvals, and comments for each active engagement.
          </p>
        </div>

        <div className="divide-y divide-[var(--border-default)]">
          {projects.map((project) => (
            <article
              className="grid grid-cols-1 gap-5 p-5 transition-[background-color] duration-200 hover:bg-[rgba(255,255,255,0.025)] lg:grid-cols-[minmax(0,1fr)_240px_150px] lg:items-center"
              key={project.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-2xl font-normal leading-tight text-[var(--ink-primary)]">
                    {project.name}
                  </h3>
                  <Badge variant={statusBadgeVariant[project.status] ?? "draft"}>
                    {statusLabels[project.status] ?? project.status}
                  </Badge>
                </div>
                <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-[var(--ink-secondary)]">
                  {project.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-sunken)]">
                  <div className="h-full rounded-full bg-[var(--gold-core)]" style={{ width: `${project.progress}%` }} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] text-[var(--ink-secondary)]">
                  <span className="inline-flex items-center gap-2">
                    <Clock aria-hidden="true" className="size-4 text-[var(--ink-tertiary)]" />
                    {project.lastUpdate}
                  </span>
                  {project.pendingItems > 0 && (
                    <span className="inline-flex items-center gap-2 text-[var(--gold-core)]">
                      <FileText aria-hidden="true" className="size-4" />
                      {project.pendingItems} awaiting review
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-start lg:justify-end">
                <Button asChild variant="ghost">
                  <Link href={`/portal/${clientSlug}/projects/${project.id}`}>
                    Open project
                    <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lux-panel p-6" data-reveal>
        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div>
            <p className="lux-meta">Recent activity</p>
            <h2 className="mt-3 font-display text-[32px] font-normal leading-tight text-[var(--ink-primary)]">
              What changed since you last looked.
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {activity.map((item, i) => (
              <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0" key={i}>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--bg-elevated)] text-[12px] font-medium text-[var(--ink-primary)]">
                  {item.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] leading-6 text-[var(--ink-secondary)]">
                    <span className="font-medium text-[var(--ink-primary)]">{item.actor}</span> {item.action}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
