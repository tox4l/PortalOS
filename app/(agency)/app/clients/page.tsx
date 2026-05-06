import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Buildings, Plus, Briefcase } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.agencyId) redirect("/onboarding");

  const clients = await prisma.client.findMany({
    where: { agencyId: session.user.agencyId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { projects: true } },
    },
  });

  return (
    <div className="space-y-12">
      <section data-reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">Clients</p>
            <h1 className="mt-6 max-w-[720px] font-display text-[clamp(2.75rem,5vw,5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-[var(--ink-primary)] text-balance">
              Every brand you serve.
            </h1>
            <p className="mt-5 max-w-[600px] text-[18px] leading-[1.7] text-[var(--ink-secondary)]">
              Manage client portals, project access, and team invitations from one place.
            </p>
          </div>
          <Button asChild>
            <Link href="/app/clients/new">
              <Plus aria-hidden="true" className="size-4" weight="bold" />
              New client
            </Link>
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-6 font-sans">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-medium tabular-nums text-[var(--ink-primary)]">
              {clients.length}
            </span>
            <span className="text-[13px] text-[var(--ink-tertiary)]">active clients</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-medium tabular-nums text-[var(--ink-primary)]">
              {clients.reduce((sum, c) => sum + c._count.projects, 0)}
            </span>
            <span className="text-[13px] text-[var(--ink-tertiary)]">total projects</span>
          </div>
        </div>
      </section>

      {clients.length === 0 ? (
        <section className="surface-panel flex min-h-[320px] flex-col items-center justify-center p-12 text-center" data-reveal>
          <Buildings aria-hidden="true" className="size-10 text-[var(--ink-tertiary)]" />
          <p className="mt-4 font-display text-[28px] font-normal leading-[1.2] text-[var(--ink-primary)]">
            No clients yet
          </p>
          <p className="mt-3 max-w-[440px] text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
            Add your first client to set up their portal, start projects, and collaborate.
          </p>
          <Button asChild className="mt-6">
            <Link href="/app/clients/new">
              <Plus aria-hidden="true" className="size-4" weight="bold" />
              Add your first client
            </Link>
          </Button>
        </section>
      ) : (
        <section className="surface-panel divide-y divide-[var(--border-hairline)]" data-reveal>
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/portal/${c.portalSlug}`}
              className="flex flex-col gap-3 px-6 py-5 transition-colors hover:bg-[var(--neutral-bg)] no-underline sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-[16px] font-medium leading-6 text-[var(--ink-primary)] truncate">
                    {c.companyName}
                  </p>
                  <Badge variant="active">Active</Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--ink-tertiary)]">
                  <span className="flex items-center gap-1.5">
                    <Briefcase aria-hidden="true" className="size-3.5" />
                    {c._count.projects} project{c._count.projects !== 1 ? "s" : ""}
                  </span>
                  <span>{c.portalSlug}.portalos.tech</span>
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
