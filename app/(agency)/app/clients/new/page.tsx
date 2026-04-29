import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientCreateForm } from "@/components/agency/client-create-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewClientPage() {
  return (
    <div className="space-y-8">
      <Button asChild variant="ghost">
        <Link href="/app/clients">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to clients
        </Link>
      </Button>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <p className="section-label">New client</p>
          <h2 className="mt-6 max-w-[760px] font-display text-[40px] font-normal leading-[1.12] tracking-[-0.015em] md:text-[56px] md:leading-[1.05]">
            Open a calm room for the next client
          </h2>
          <p className="mt-6 max-w-[580px] text-[15px] leading-7 text-[var(--ink-secondary)]">
            Create the client record, primary contact, portal slug, and first welcome note in one pass.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portal preview</CardTitle>
            <CardDescription>
              Branding settings arrive in Phase 5; this uses the agency default surface for now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                Client portal
              </p>
              <h3 className="mt-4 font-display text-xl font-medium leading-tight">
                Welcome back
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-secondary)]">
                Active projects, recent approvals, comments, and files will appear here after the client is created.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Client details</CardTitle>
          <CardDescription>
            The submit action is ready for authenticated owner/admin users once PostgreSQL is connected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
