import Link from "next/link";
import { ArrowLeft, CalendarDays, FileText, Rows3 } from "lucide-react";
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
          <h2 className="mt-6 max-w-[760px] font-display text-[40px] font-normal leading-[1.12] tracking-[-0.015em] md:text-[56px] md:leading-[1.05]">
            Give the work a precise home
          </h2>
          <p className="mt-6 max-w-[580px] text-[15px] leading-7 text-[var(--ink-secondary)]">
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
              { label: "Board", icon: Rows3 },
              { label: "Brief", icon: FileText },
              { label: "Due date", icon: CalendarDays }
            ].map((item) => (
              <div
                className="flex items-center gap-3 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] p-4"
                key={item.label}
              >
                <item.icon aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>
            The submit action is wired and will create a Prisma project once the selected client IDs come from the live database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
