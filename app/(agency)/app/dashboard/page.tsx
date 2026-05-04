import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle,
  ClockCountdown,
  FileDashed,
  FolderSimpleDashed,
  Lightning,
  Plus,
  Timer,
} from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.agencyId) redirect("/login");

  const agencyId = session.user.agencyId;

  // Growth plan users on apex or www → redirect to subdomain
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "";
  const isOnApexOrWww = host === "portalos.tech" || host === "www.portalos.tech";
  if (isOnApexOrWww) {
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: { slug: true, plan: true },
    });
    if (agency?.plan === "GROWTH" && agency.slug) {
      redirect(`https://${agency.slug}.portalos.tech/app/dashboard`);
    }
  }

  const [activeProjects, totalDeliverables, pendingApprovals, urgentTasks, recentProjects, recentActivity] =
    await Promise.all([
      prisma.project.count({ where: { agencyId, status: "ACTIVE" } }),
      prisma.deliverable.count({
        where: { project: { agencyId } },
      }),
      prisma.deliverable.count({
        where: { project: { agencyId }, status: "PENDING_REVIEW" },
      }),
      prisma.task.count({
        where: { project: { agencyId }, priority: "URGENT", status: { not: "DONE" } },
      }),
      prisma.project.findMany({
        where: { agencyId, status: { not: "ARCHIVED" } },
        select: {
          id: true,
          name: true,
          status: true,
          dueDate: true,
          client: { select: { companyName: true } },
          tasks: { select: { id: true, status: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.activityEvent.findMany({
        where: { agencyId },
        select: {
          type: true,
          title: true,
          body: true,
          createdAt: true,
          actorUser: { select: { name: true } },
          actorClientUser: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const isNewAgency = activeProjects === 0 && totalDeliverables === 0;

  const statusBadgeVariant: Record<string, "active" | "review" | "draft" | "archived"> = {
    ACTIVE: "active",
    IN_REVIEW: "review",
    DRAFT: "draft",
    COMPLETE: "active",
    ARCHIVED: "archived",
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: "Active",
    IN_REVIEW: "In Review",
    DRAFT: "Draft",
    COMPLETE: "Complete",
    ARCHIVED: "Archived",
  };

  function progressForProject(tasks: { id: string; status: string }[]): number {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.status === "DONE").length;
    return Math.round((done / tasks.length) * 100);
  }

  function timeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function dueLabel(date: Date | null): string {
    if (!date) return "No due date";
    const diff = date.getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Due today";
    return `Due in ${days} days`;
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="surface-panel overflow-hidden p-6 md:p-8" data-reveal>
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="section-label">Agency command</p>
            <h2 className="mt-6 max-w-[760px] font-display text-[clamp(2.5rem,5vw,5.4rem)] font-normal leading-[0.98] tracking-[-0.025em] text-[var(--ink-primary)] text-balance">
              {isNewAgency
                ? `${session.user.agencyName ?? "PortalOS"} is ready.`
                : "Tonight is already sorted."}
            </h2>
            <p className="mt-5 max-w-[560px] text-[0.9375rem] leading-7 text-[var(--ink-secondary)]">
              {isNewAgency
                ? "Everything is set up. Create your first project, invite your team, and start collaborating with clients."
                : `${activeProjects} active projects, ${pendingApprovals} pending approvals, and ${urgentTasks} urgent tasks waiting.`}
            </p>
            {isNewAgency && (
              <Button asChild className="mt-6" size="lg">
                <Link href="/app/projects/new">
                  <Plus aria-hidden="true" className="size-4" />
                  Create your first project
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        className="surface-panel grid grid-cols-1 divide-y divide-[var(--border-hairline)] md:grid-cols-4 md:divide-x md:divide-y-0"
        data-reveal
      >
        {[
          { label: "Active projects", value: activeProjects, icon: Lightning, tone: "review" as const },
          { label: "Files delivered", value: totalDeliverables, icon: FolderSimpleDashed, tone: "approved" as const },
          { label: "Pending approvals", value: pendingApprovals, icon: CheckCircle, tone: "review" as const },
          { label: "Urgent tasks", value: urgentTasks, icon: ClockCountdown, tone: "overdue" as const },
        ].map((stat, index) => (
          <div className="p-6" data-delay={index * 60} data-reveal key={stat.label}>
            <div className="flex items-center justify-between gap-4">
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">
                {stat.label}
              </p>
              <stat.icon aria-hidden="true" className="size-4 text-[var(--gold-core)]" weight="duotone" />
            </div>
            <div className="mt-5">
              <p className="font-display text-[2.625rem] font-normal leading-none tracking-[-0.04em] text-[var(--ink-primary)]">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Projects + Approval queue */}
      {!isNewAgency && (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          <div className="surface-panel" data-reveal>
            <div className="flex flex-col gap-4 border-b border-[var(--border-hairline)] p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-[2rem] font-normal leading-tight text-[var(--ink-primary)]">
                  Delivery runway
                </h2>
                <p className="mt-2 text-[0.875rem] leading-6 text-[var(--ink-secondary)]">
                  Recent projects and their progress.
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href="/app/projects">
                  View all
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-[var(--border-hairline)]">
              {recentProjects.map((project) => {
                const progress = progressForProject(project.tasks);
                return (
                  <article
                    className="workspace-row grid grid-cols-1 gap-5 p-5 md:grid-cols-[minmax(0,1fr)_150px_170px]"
                    key={project.id}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-[1.5rem] font-normal leading-tight text-[var(--ink-primary)]">
                          {project.name}
                        </h3>
                        <Badge variant={statusBadgeVariant[project.status] ?? "draft"}>
                          {statusLabels[project.status] ?? project.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[0.875rem] text-[var(--ink-secondary)]">{project.client.companyName}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between font-mono text-[0.625rem] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-sunken)]">
                        <div
                          className="h-full rounded-full bg-[var(--gold-core)] transition-[width] duration-[var(--t-slow)] ease-[var(--ease-out)]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="flex items-center gap-2 text-[0.8125rem] text-[var(--ink-tertiary)] md:justify-end">
                      <Timer aria-hidden="true" className="size-4" />
                      {dueLabel(project.dueDate)}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="surface-panel p-6" data-delay={90} data-reveal>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-[1.75rem] font-normal leading-tight text-[var(--ink-primary)]">
                  Approval queue
                </h2>
                <p className="mt-2 text-[0.875rem] leading-6 text-[var(--ink-secondary)]">
                  Items waiting for decisions.
                </p>
              </div>
              <FileDashed aria-hidden="true" className="size-5 text-[var(--gold-core)]" weight="duotone" />
            </div>
            <div className="mt-5 space-y-3">
              {pendingApprovals === 0 ? (
                <p className="text-[0.875rem] text-[var(--ink-tertiary)] font-serif italic">
                  Nothing waiting for approval. Clear runway.
                </p>
              ) : (
                <p className="text-[0.875rem] text-[var(--ink-secondary)]">
                  {pendingApprovals} deliverables waiting for client review.
                </p>
              )}
            </div>
          </aside>
        </section>
      )}

      {/* Activity or empty state */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,430px)_1fr]">
        <div className="surface-panel p-6" data-reveal>
          <h2 className="font-display text-[1.75rem] font-normal leading-tight text-[var(--ink-primary)]">
            Recent activity
          </h2>
          <p className="mt-2 text-[0.875rem] text-[var(--ink-secondary)]">
            Workroom updates from clients and team.
          </p>
          {recentActivity.length === 0 ? (
            <p className="mt-8 text-[0.875rem] text-[var(--ink-tertiary)] font-serif italic">
              Activity will appear here as your team and clients collaborate.
            </p>
          ) : (
            <div className="relative mt-7 space-y-5 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-[var(--border-hairline)]">
              {recentActivity.map((event, i) => {
                const actorName =
                  event.actorUser?.name ?? event.actorClientUser?.name ?? "Someone";
                const initials = actorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const kind = event.actorUser ? "Team" : "Client";
                return (
                  <div className="relative flex gap-3" key={i}>
                    <div className="z-[1] flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[0.75rem] font-sans font-medium text-[var(--ink-primary)]">
                      {initials}
                    </div>
                    <div className="min-w-0 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[0.875rem] font-sans font-medium text-[var(--ink-primary)]">{actorName}</p>
                        <span className="font-sans text-[0.6875rem] uppercase tracking-[0.06em] text-[var(--ink-tertiary)]">{kind}</span>
                      </div>
                      <p className="text-[0.875rem] leading-6 text-[var(--ink-secondary)]">{event.body}</p>
                      <p className="mt-0.5 font-sans text-[0.6875rem] uppercase tracking-[0.05em] text-[var(--ink-tertiary)]">{timeAgo(event.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="surface-panel p-6" data-delay={90} data-reveal>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div>
              <p className="flex items-center gap-2 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[var(--gold-core)]">
                <FolderSimpleDashed aria-hidden="true" className="size-4" weight="duotone" />
                Workspace
              </p>
              <h2 className="mt-6 max-w-[620px] font-display text-[2rem] font-normal leading-tight text-[var(--ink-primary)]">
                {isNewAgency
                  ? "Start with your first project."
                  : "Keep the momentum going."}
              </h2>
              <p className="mt-3 max-w-[560px] text-[0.875rem] leading-6 text-[var(--ink-secondary)]">
                {isNewAgency
                  ? "Create a project, add a client, and start uploading deliverables. Your clients will see everything in their branded portal."
                  : `${session.user.agencyName ?? "Your agency"} has ${activeProjects} active projects. Review attention without the chase.`}
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href={isNewAgency ? "/app/projects/new" : "/app/projects"}>
                {isNewAgency ? "Create project" : "View projects"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
