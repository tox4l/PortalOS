import Link from "next/link";
import { ArrowLeft, CalendarBlank, FileText, Rows } from "@phosphor-icons/react";
import { ProjectCreateForm } from "@/components/agency/project-create-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <Button asChild variant="ghost">
        <Link href="/app/projects">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to projects
        </Link>
      </Button>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <p className="section-label">New project</p>
          <h2 className="mt-6 max-w-[760px] font-display text-[2.5rem] font-normal leading-[1.12] tracking-[-0.015em] md:text-[3.5rem] md:leading-[1.05] text-[var(--ink-primary)]">
            Give the work a precise home
          </h2>
          <p className="mt-6 max-w-[580px] text-[0.9375rem] leading-7 text-[var(--ink-secondary)]">
            Create the project shell now. The workspace tabs arrive next: board, brief, deliverables, and comments.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workspace preview</CardTitle>
            <CardDescription>Each project opens with the same composed operating surface.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Board", icon: Rows },
              { label: "Brief", icon: FileText },
              { label: "Due date", icon: CalendarBlank }
            ].map((item) => (
              <div
                className="surface-panel bg-[var(--bg-sunken)] border-[var(--border-subtle)] p-4 flex items-center gap-3"
                key={item.label}
              >
                <item.icon aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" />
                <span className="text-[0.875rem] font-sans font-medium text-[var(--ink-primary)]">{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>
            Configure your new project details below. All fields can be edited later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
