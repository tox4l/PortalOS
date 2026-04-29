import Link from "next/link";
import { ArrowUpRight, FileText, Plus } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const invoices = [
  {
    id: "inv-001",
    client: "Northstar Branding",
    project: "Brand Identity Refresh",
    amount: 4250,
    status: "Sent",
    due: "Due in 18 days",
    badge: "review" as const
  },
  {
    id: "inv-002",
    client: "Northstar Branding",
    project: "Website Copy",
    amount: 2800,
    status: "Draft",
    due: "Not sent",
    badge: "draft" as const
  },
  {
    id: "inv-003",
    client: "Forge Studio",
    project: "Q4 Campaign",
    amount: 6900,
    status: "Paid",
    due: "Paid Apr 18",
    badge: "approved" as const
  },
  {
    id: "inv-004",
    client: "Vessel Co.",
    project: "Packaging Redesign",
    amount: 5100,
    status: "Overdue",
    due: "Due Apr 02",
    badge: "overdue" as const
  },
  {
    id: "inv-005",
    client: "Apex Creative",
    project: "Social Media Kit",
    amount: 1800,
    status: "Paid",
    due: "Paid Mar 28",
    badge: "approved" as const
  }
];

const totalOutstanding = invoices
  .filter((inv) => inv.status === "Sent" || inv.status === "Overdue")
  .reduce((sum, inv) => sum + inv.amount, 0);

export default function InvoicesPage() {
  return (
    <div className="space-y-8">
      <section className="lux-panel grid grid-cols-1 divide-y divide-[var(--border-default)] md:grid-cols-4 md:divide-x md:divide-y-0" data-reveal>
        {[
          { label: "Total invoiced", value: "$20,850" },
          { label: "Outstanding", value: `$${totalOutstanding.toLocaleString()}` },
          { label: "Paid this month", value: "$8,700" },
          { label: "Overdue", value: "1" }
        ].map((stat) => (
          <div className="p-5" key={stat.label}>
            <p className="lux-meta">{stat.label}</p>
            <p className="mt-3 font-mono text-[32px] leading-none text-[var(--ink-primary)]">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="lux-panel" data-reveal>
        <div className="flex flex-col gap-4 border-b border-[var(--border-default)] p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-[32px] font-normal leading-tight text-[var(--ink-primary)]">All invoices</h2>
            <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">Track billing across all client engagements.</p>
          </div>
          <Button asChild>
            <Link href="/app/projects">
              <Plus aria-hidden="true" className="size-4" />
              New invoice
            </Link>
          </Button>
        </div>

        <div className="divide-y divide-[var(--border-default)]">
          {invoices.map((invoice) => (
            <article
              className="grid grid-cols-1 gap-4 p-5 transition-colors duration-200 hover:bg-[rgba(255,255,255,0.025)] md:grid-cols-[minmax(0,1fr)_180px_140px_120px]"
              key={invoice.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)]">
                    <FileText aria-hidden="true" className="size-4 text-[var(--ink-tertiary)]" weight="duotone" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--ink-primary)]">{invoice.project}</p>
                    <p className="text-[14px] text-[var(--ink-secondary)]">{invoice.client}</p>
                  </div>
                </div>
              </div>
              <p className="flex items-center font-mono text-[18px] text-[var(--ink-primary)]">
                ${invoice.amount.toLocaleString()}
              </p>
              <div className="flex items-center">
                <Badge variant={invoice.badge}>{invoice.status}</Badge>
              </div>
              <div className="flex items-center justify-between gap-2 md:justify-end">
                <span className="text-[13px] text-[var(--ink-tertiary)]">{invoice.due}</span>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/app/projects/dev-proj-001`}>
                    View
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
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
