import { redirect } from "next/navigation";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.agencyId) redirect("/onboarding");

  return (
    <div className="space-y-12">
      <section data-reveal>
        <p className="section-label">Invoices</p>
        <h1 className="mt-6 max-w-[720px] font-display text-[clamp(2.75rem,5vw,5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-[var(--ink-primary)] text-balance">
          Billing, simplified.
        </h1>
        <p className="mt-5 max-w-[600px] text-[18px] leading-[1.7] text-[var(--ink-secondary)]">
          Create and track client invoices. Coming soon — Stripe integration will power this page.
        </p>
      </section>

      <section className="surface-panel flex min-h-[360px] flex-col items-center justify-center p-12 text-center" data-reveal>
        <FileText aria-hidden="true" className="size-10 text-[var(--ink-tertiary)]" />
        <p className="mt-4 font-display text-[28px] font-normal leading-[1.2] text-[var(--ink-primary)]">
          Invoicing coming soon
        </p>
        <p className="mt-3 max-w-[440px] text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
          Billing and invoicing features are under development. Your existing Stripe integration will power this when it launches.
        </p>
      </section>
    </div>
  );
}
