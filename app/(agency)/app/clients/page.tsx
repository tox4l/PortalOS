import Link from "next/link";
import { ArrowUpRight, Briefcase, Buildings, Clock, Plus } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const clients = [
  {
    company: "Northstar Branding",
    contact: "Iris Calloway",
    email: "client@lumina-demo.com",
    status: "Active",
    projects: 2,
    reviews: 3,
    lastUpdate: "Today",
    badge: "active" as const
  },
  {
    company: "Forge Studio",
    contact: "Theo Watanabe",
    email: "theo@forge-demo.com",
    status: "Active",
    projects: 1,
    reviews: 1,
    lastUpdate: "3 days ago",
    badge: "active" as const
  },
  {
    company: "Vessel Co.",
    contact: "Marin Sol",
    email: "marin@vessel-demo.com",
    status: "Archived",
    projects: 1,
    reviews: 0,
    lastUpdate: "22 days ago",
    badge: "archived" as const
  }
];

const metrics = [
  ["Active clients", "2"],
  ["Open projects", "4"],
  ["Pending reviews", "4"]
];

export default function ClientsPage() {
  return (
    <div className="space-y-8">
      <section className="lux-panel p-6 md:p-8" data-reveal>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <p className="section-label">Client rooms</p>
            <h2 className="mt-7 max-w-[760px] font-display text-[clamp(3rem,5vw,5.5rem)] font-normal leading-[0.98] tracking-[-0.025em] text-[var(--ink-primary)] text-balance">
              Relationships with a private entrance.
            </h2>
            <p className="mt-7 max-w-[620px] text-[16px] leading-7 text-[var(--ink-secondary)]">
              Each client gets a branded room for projects, approvals, files, and the small decisions that keep work moving.
            </p>
          </div>

          <div className="grid content-end gap-3">
            {metrics.map(([label, value]) => (
              <div
                className="flex items-center justify-between gap-6 border-b border-[var(--border-default)] py-4 last:border-b-0"
                key={label}
              >
                <p className="lux-meta">{label}</p>
                <p className="font-mono text-[24px] leading-none text-[var(--ink-primary)]">{value}</p>
              </div>
            ))}
            <Button asChild className="mt-4">
              <Link href="/app/clients/new">
                <Plus aria-hidden="true" className="size-4" />
                New client
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="lux-panel overflow-hidden" data-reveal>
        <div className="grid grid-cols-[1.3fr_1fr_180px_92px] border-b border-[var(--border-default)] bg-[var(--bg-sunken)] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-tertiary)] max-lg:hidden">
          <span>Client</span>
          <span>Engagement</span>
          <span>Status</span>
          <span className="text-right">Open</span>
        </div>

        <div className="divide-y divide-[var(--border-default)]">
          {clients.map((client) => (
            <article
              className="grid grid-cols-1 gap-5 p-5 transition-[background-color] duration-200 hover:bg-[rgba(255,255,255,0.025)] lg:grid-cols-[1.3fr_1fr_180px_92px] lg:items-center"
              key={client.company}
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-elevated)]">
                  <Buildings aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" weight="duotone" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-2xl font-normal leading-tight text-[var(--ink-primary)]">
                    {client.company}
                  </h3>
                  <p className="mt-1 truncate text-sm text-[var(--ink-secondary)]">
                    {client.contact} / {client.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-[13px] text-[var(--ink-secondary)]">
                <span className="inline-flex items-center gap-2">
                  <Briefcase aria-hidden="true" className="size-4 text-[var(--ink-tertiary)]" />
                  {client.projects} projects
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock aria-hidden="true" className="size-4 text-[var(--ink-tertiary)]" />
                  {client.reviews > 0 ? `${client.reviews} reviews waiting` : "No pending reviews"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={client.badge}>{client.status}</Badge>
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--ink-tertiary)]">
                  {client.lastUpdate}
                </span>
              </div>

              <div className="flex justify-start lg:justify-end">
                <Button asChild aria-label={`Open projects for ${client.company}`} size="icon" variant="ghost">
                  <Link href="/app/projects">
                    <ArrowUpRight aria-hidden="true" className="size-5" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
