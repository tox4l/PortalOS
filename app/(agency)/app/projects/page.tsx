import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CheckCircle, Plus, UserCircle } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusBadge = {
  DRAFT: "draft" as const,
  ACTIVE: "active" as const,
  IN_REVIEW: "review" as const,
  COMPLETE: "approved" as const,
  ARCHIVED: "archived" as const,
};

const statusLabel = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  IN_REVIEW: "In Review",
  COMPLETE: "Complete",
  ARCHIVED: "Archived",
};

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.agencyId) redirect("/onboarding");

  const projects = await prisma.project.findMany({
    where: { agencyId: session.user.agencyId },
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { companyName: true } },
      createdBy: { select: { name: true } },
      _count: { select: { tasks: true } },
    },
  });

  const totalTasks = projects.reduce((sum, p) => sum + p._count.tasks, 0);
  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;
  const reviewCount = projects.filter((p) => p.status === "IN_REVIEW").length;

  return (
    <div className="space-y-12">
      <section data-reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">Projects</p>
            <h1 className="mt-6 max-w-[720px] font-display text-[clamp(2.75rem,5vw,5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-[var(--ink-primary)] text-balance">
              Client work, shipping.
            </h1>
            <p className="mt-5 max-w-[600px] text-[18px] leading-[1.7] text-[var(--ink-secondary)]">
              Every project, its deliverables, and what needs your attention next.
            </p>
          </div>
          <Button asChild>
            <Link href="/app/projects/new">
              <Plus aria-hidden="true" className="size-4" weight="bold" />
              New project
            </Link>
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-6 font-sans">
          <MetricsBadge value={projects.length} label="total projects" />
          <MetricsBadge value={activeCount} label="active" />
          <MetricsBadge value={reviewCount} label="in review" />
          <MetricsBadge value={totalTasks} label="total tasks" />
        </div>
      </section>

      {projects.length === 0 ? (
        <section className="surface-panel flex min-h-[320px] flex-col items-center justify-center p-12 text-center" data-reveal>
          <p className="font-display text-[28px] font-normal leading-[1.2] text-[var(--ink-primary)]">
            No projects yet
          </p>
          <p className="mt-3 max-w-[440px] text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
            Create your first project to start tracking deliverables, tasks, and client communication.
          </p>
          <Button asChild className="mt-6">
            <Link href="/app/projects/new">
              <Plus aria-hidden="true" className="size-4" weight="bold" />
              Create your first project
            </Link>
          </Button>
        </section>
      ) : (
        <section className="surface-panel divide-y divide-[var(--border-hairline)]" data-reveal>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/app/projects/${p.id}`}
              className="flex flex-col gap-3 px-6 py-5 transition-colors hover:bg-[var(--neutral-bg)] no-underline sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-[16px] font-medium leading-6 text-[var(--ink-primary)] truncate">
                    {p.name}
                  </p>
                  <Badge variant={statusBadge[p.status]}>{statusLabel[p.status]}</Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--ink-tertiary)]">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[var(--gold-core)]" />
                    {p.client.companyName}
                  </span>
                  {p.createdBy?.name && (
                    <span className="flex items-center gap-1.5">
                      <UserCircle aria-hidden="true" className="size-3.5" />
                      {p.createdBy.name}
                    </span>
                  )}
                  {p._count.tasks > 0 && (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle aria-hidden="true" className="size-3.5" />
                      {p._count.tasks} tasks
                    </span>
                  )}
                </div>
              </div>
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-[var(--ink-tertiary)]" />
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

function MetricsBadge({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[20px] font-medium tabular-nums text-[var(--ink-primary)]">{value}</span>
      <span className="text-[13px] text-[var(--ink-tertiary)]">{label}</span>
    </div>
  );
}
