import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { isDevBypass, getDevPortalClient, getDevPortalActivity } from "@/lib/dev-bypass";
import { getClientSession } from "@/lib/client-sessions";
import { prisma } from "@/lib/db";

type ActivityPageProps = {
  params: Promise<{ clientSlug: string }>;
};

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { clientSlug } = await params;

  if (isDevBypass()) {
    const client = getDevPortalClient(clientSlug);
    if (!client) notFound();

    const activity = getDevPortalActivity();

    return (
      <ActivityContent
        clientSlug={clientSlug}
        clientName={client.companyName}
        activity={activity}
      />
    );
  }

  const session = await getClientSession();
  if (!session || session.clientSlug !== clientSlug) {
    notFound();
  }

  const client = await prisma.client.findUnique({
    where: { portalSlug: clientSlug, agencyId: session.agencyId },
    select: { id: true, companyName: true },
  });

  if (!client) notFound();

  const events = await prisma.activityEvent.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      createdAt: true,
      actorUser: { select: { id: true, name: true } },
      actorClientUser: { select: { id: true, name: true } },
    },
  });

  const activity = events.map((e) => {
    const actor =
      e.actorUser?.name ?? e.actorClientUser?.name ?? "Someone";
    const initials = actor
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return {
      initials,
      actor,
      action: e.body,
      time: new Date(e.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  });

  return (
    <ActivityContent
      clientSlug={clientSlug}
      clientName={client.companyName}
      activity={activity}
    />
  );
}

function ActivityContent({
  clientSlug,
  clientName,
  activity,
}: {
  clientSlug: string;
  clientName: string;
  activity: Array<{ initials: string; actor: string; action: string; time: string }>;
}) {
  return (
    <div className="space-y-12">
      <Link
        className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--ink-tertiary)] transition-colors duration-[180ms] ease-[var(--ease-out)] hover:text-[var(--gold-core)]"
        href={`/portal/${clientSlug}`}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to projects
      </Link>

      <section data-reveal>
        <p className="section-label">Activity</p>
        <h1 className="mt-6 max-w-[760px] font-display text-[clamp(2.75rem,5vw,5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-[var(--ink-primary)] text-balance">
          Everything that happened since your last visit.
        </h1>
        <p className="mt-5 max-w-[600px] text-[18px] leading-[1.7] text-[var(--ink-secondary)]">
          Approvals, uploads, comments, and status changes for{" "}
          <span className="font-semibold text-[var(--ink-primary)]">{clientName}</span>{" "}
          -- every action leaves a trace. Agency-internal notes are never shown here.
        </p>
      </section>

      <section className="surface-panel divide-y divide-[var(--border-hairline)]" data-reveal>
        {activity.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center p-12 text-center">
            <p className="font-display text-[28px] font-normal leading-[1.2] text-[var(--ink-primary)]">
              No activity yet
            </p>
            <p className="mt-3 max-w-[440px] text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
              Activity from your agency team will appear here as they share files, request approvals, and post updates.
            </p>
          </div>
        ) : (
          activity.map((item, i) => (
            <div className="flex items-center gap-5 p-6" key={i}>
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[12px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)] font-sans text-[14px] font-semibold text-[var(--gold-core)]">
                {item.initials}
              </div>
              <div className="min-w-0">
                <p className="text-[16px] leading-6 text-[var(--ink-secondary)]">
                  <span className="font-semibold text-[var(--ink-primary)]">{item.actor}</span>{" "}
                  {item.action}
                </p>
                <p className="mt-1.5 font-sans text-[11px] uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">
                  {item.time}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
