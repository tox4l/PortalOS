import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileText,
  Paperclip,
  ShieldCheck,
  User,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ScrollAwareHeader } from "@/components/shared/scroll-aware-header";

const agency = {
  name: "Your Agency",
  brandColor: "#D4AF37",
};

const client = {
  name: "You",
  company: "Your Company",
};

const walkthroughProjects = [
  {
    name: "Your project appears here",
    status: "Example",
    description:
      "Each project your agency is working on for you will show up here with its name, status, due date, and a description of what's being delivered. Click into any project to see files, leave comments, and track progress.",
  },
  {
    name: "Another active project",
    status: "Example",
    description:
      "You can have multiple active projects with the same agency. Each one gets its own dedicated room where all communication, files, and approvals stay organized.",
  },
];

const walkthroughApprovals = [
  {
    name: "Deliverable ready for your review",
    description:
      "When your agency finishes a milestone — a presentation deck, a brand guide, a website draft — it lands here for your review. You can approve it, request changes, or leave comments directly on the file.",
  },
  {
    name: "Another item awaiting feedback",
    description:
      "No more digging through email attachments. Every review item is timestamped, versioned, and linked to the conversation around it. Your agency sees your feedback instantly.",
  },
];

const walkthroughFiles = [
  {
    name: "brand-guidelines-v3.pdf",
    description: "Final deliverables shared by your agency",
  },
  {
    name: "presentation-deck-final.pdf",
    description: "Review-ready files appear here",
  },
  {
    name: "project-assets.zip",
    description: "Bulk downloads organized by project",
  },
];

export default function ClientDemoPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--bg-void)] text-[var(--ink-primary)]">
      <ScrollAwareHeader>
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link
              className="font-display text-2xl font-normal tracking-[-0.01em]"
              href="/"
              style={{ color: agency.brandColor }}
            >
              {agency.name}
            </Link>
            <span className="hidden h-5 w-px bg-[var(--border-subtle)] sm:block" />
            <span className="hidden text-[13px] font-medium tracking-[0.02em] text-[var(--ink-tertiary)] sm:inline">
              Client Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Badge variant="review">Tour mode</Badge>
            <div className="flex size-9 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[13px] font-medium text-[var(--ink-secondary)]">
              <User aria-hidden="true" className="size-4" weight="bold" />
            </div>
          </div>
        </div>
      </ScrollAwareHeader>

      <main className="mx-auto max-w-[1280px] px-4 py-12 md:px-8">
        {/* Welcome */}
        <section className="mb-16">
          <p className="section-label">Product tour — Client side</p>
          <h1 className="mt-4 max-w-[700px] font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.04] tracking-[-0.015em] text-[var(--ink-primary)] sm:text-[clamp(2.4rem,5vw,4rem)]">
            This is what your clients will see.
          </h1>
          <p className="mt-5 max-w-[620px] text-[16px] leading-7 text-[var(--ink-secondary)]">
            Every section below is part of the branded portal your clients enter. Instead of fake
            data, each area explains what your clients will find here once your agency starts sharing
            work through PortalOS.
          </p>
        </section>

        {/* Client identity strip */}
        <div className="surface-panel mb-16 flex flex-wrap items-center gap-6 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[15px] font-medium text-[var(--ink-tertiary)]">
              —
            </div>
            <div>
              <p className="font-medium text-[var(--ink-primary)]">Your client&apos;s name</p>
              <p className="text-[13px] text-[var(--ink-secondary)]">Their company</p>
            </div>
          </div>
          <span className="h-8 w-px bg-[var(--border-hairline)]" />
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-[var(--gold-core)]" weight="bold" />
              Private room
            </span>
            <span>Tour mode</span>
          </div>
          <p className="text-[13px] leading-6 text-[var(--ink-tertiary)]">
            Each client sees their own name and company here. The portal is private to them — they
            can&apos;t see other clients or internal agency notes.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          <div className="space-y-20">
            {/* Active Projects */}
            <section>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-label">Projects</p>
                  <h2 className="mt-4 font-display text-[clamp(1.5rem,3.5vw,2.2rem)] font-normal leading-tight text-[var(--ink-primary)]">
                    Here your clients will find their projects
                  </h2>
                </div>
              </div>
              <p className="mt-3 max-w-[600px] text-[14px] leading-6 text-[var(--ink-secondary)]">
                Every active engagement appears as a card. Clients see the project name, current
                status, due date, and a description of what&apos;s being delivered. They click through
                to a dedicated project room with files, comments, and approvals.
              </p>
              <div className="mt-8 space-y-4">
                {walkthroughProjects.map((project, index) => (
                  <article
                    className="surface-panel border-dashed p-6"
                    key={project.name}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]">
                        {project.name}
                      </h3>
                      <Badge variant="draft">{project.status}</Badge>
                    </div>
                    <p className="mt-3 text-[14px] leading-6 text-[var(--ink-secondary)]">
                      {project.description}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-4 text-[12px] text-[var(--ink-tertiary)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock aria-hidden="true" className="size-3.5" weight="bold" />
                        Due date set by your agency
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Pending Approvals */}
            <section>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-label">For your review</p>
                  <h2 className="mt-4 font-display text-[clamp(1.5rem,3.5vw,2.2rem)] font-normal leading-tight text-[var(--ink-primary)]">
                    Here your clients will review and approve work
                  </h2>
                </div>
              </div>
              <p className="mt-3 max-w-[600px] text-[14px] leading-6 text-[var(--ink-secondary)]">
                When your agency finishes a deliverable, it lands here. Clients review it, leave
                comments, and approve — all inside the portal. No email chains, no &quot;which version
                was final?&quot;
              </p>
              <div className="mt-8 space-y-3">
                {walkthroughApprovals.map((item, index) => (
                  <article
                    className="surface-panel flex items-start gap-5 border-dashed p-5"
                    key={item.name}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-sunken)] font-mono text-[13px] tabular-nums text-[var(--ink-tertiary)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="text-[15px] font-medium text-[var(--ink-primary)]">
                        {item.name}
                      </h4>
                      <p className="mt-1.5 text-[13px] leading-5 text-[var(--ink-secondary)]">
                        {item.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-[var(--ink-tertiary)]">
                        <span className="inline-flex items-center gap-1.5">
                          <FileText aria-hidden="true" className="size-3" weight="bold" />
                          PDF, Figma, or any file type
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <User aria-hidden="true" className="size-3" weight="bold" />
                          Uploaded by your agency
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Activity */}
            <section>
              <p className="section-label">Activity</p>
              <h2 className="mt-4 font-display text-[clamp(1.5rem,3.5vw,2.2rem)] font-normal leading-tight text-[var(--ink-primary)]">
                Here your clients will see what&apos;s been happening
              </h2>
              <p className="mt-3 max-w-[600px] text-[14px] leading-6 text-[var(--ink-secondary)]">
                Every comment, file upload, approval, and status change is recorded in a timeline.
                Clients see who did what and when — a living record of the engagement.
              </p>
              <div className="mt-8 divide-y divide-[var(--border-hairline)]">
                {[
                  { actor: "Your agency", action: "will upload deliverables here", when: "Timestamped automatically" },
                  { actor: "You", action: "can comment and approve directly", when: "No extra logins needed" },
                  { actor: "Your agency", action: "sees your feedback in real time", when: "Everything stays in context" },
                ].map((entry, index) => (
                  <div className="flex gap-4 py-4 first:pt-0 last:pb-0" key={index}>
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[12px] font-medium text-[var(--ink-tertiary)]">
                      —
                    </div>
                    <div>
                      <p className="text-[14px] leading-6">
                        <span className="font-medium text-[var(--ink-primary)]">{entry.actor}</span>{" "}
                        <span className="text-[var(--ink-secondary)]">{entry.action}</span>
                      </p>
                      <p className="mt-1 text-[12px] text-[var(--ink-tertiary)]">{entry.when}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            {/* File list */}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                Here your clients will find shared files
              </p>
              <div className="surface-panel mt-4 divide-y divide-[var(--border-hairline)]">
                {walkthroughFiles.map((file, index) => (
                  <div
                    className="flex items-center justify-between gap-3 px-4 py-3"
                    key={index}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Paperclip
                        aria-hidden="true"
                        className="size-4 shrink-0 text-[var(--ink-tertiary)]"
                        weight="bold"
                      />
                      <div>
                        <span className="block truncate text-[13px] text-[var(--ink-secondary)]">
                          {file.name}
                        </span>
                        <span className="block text-[11px] text-[var(--ink-tertiary)]">
                          {file.description}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[12px] leading-5 text-[var(--ink-tertiary)]">
                Every file your agency shares is collected here, organized by project. Clients can
                preview, download, or comment on any file without leaving the portal.
              </p>
            </div>

            {/* Info callout */}
            <div className="flex items-start gap-3 rounded-[8px] border border-[var(--border-gold-dim)] bg-[var(--gold-dim)] p-4">
              <ShieldCheck
                aria-hidden="true"
                className="size-4 shrink-0 text-[var(--gold-core)]"
                weight="bold"
              />
              <p className="text-[12px] leading-5 text-[var(--gold-mid)]">
                This is a tour of the client portal. Your actual client portal will carry your agency
                branding, custom domain, and branded email — everything your clients see will feel
                like you.
              </p>
            </div>

            {/* CTA */}
            <Button asChild className="w-full" variant="secondary">
              <Link href="/demo/agency">
                Switch to agency view
                <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
              </Link>
            </Button>
          </aside>
        </div>
      </main>
    </div>
  );
}
