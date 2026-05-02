import Link from "next/link";

export const metadata = {
  title: "Terms of Service — PortalOS",
  description: "PortalOS terms of service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--bg-void)] text-[var(--ink-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border-hairline)] bg-[var(--bg-void)]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link
            className="font-display text-2xl font-normal tracking-[-0.01em] text-[var(--gold-core)]"
            href="/"
          >
            PortalOS
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[720px] px-4 py-16 md:px-8">
        <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] font-normal leading-[1.04] tracking-[-0.015em]">
          Terms of Service
        </h1>
        <p className="mt-2 text-[14px] text-[var(--ink-tertiary)]">
          Last updated: April 30, 2026
        </p>
        <div className="mt-12 space-y-8 text-[15px] leading-7 text-[var(--ink-secondary)]">
          <section>
            <h2 className="font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]">
              1. Acceptance of terms
            </h2>
            <p className="mt-3">
              By accessing or using PortalOS, you agree to these terms. If you are using PortalOS on
              behalf of an agency, you represent that you have authority to bind that agency.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]">
              2. Subscription and billing
            </h2>
            <p className="mt-3">
              PortalOS is offered on a subscription basis. You will be billed in advance on a
              recurring basis according to your selected plan. All fees are non-refundable except as
              required by law.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]">
              3. Acceptable use
            </h2>
            <p className="mt-3">
              You agree not to misuse PortalOS services. This includes not uploading illegal content,
              not attempting to breach security, and not using the service for purposes it was not
              designed for.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]">
              4. Limitation of liability
            </h2>
            <p className="mt-3">
              PortalOS is provided as-is. We are not liable for indirect damages arising from your
              use of the service. Our total liability is limited to the fees you paid in the 12
              months preceding the claim.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]">
              5. Changes to terms
            </h2>
            <p className="mt-3">
              We may update these terms from time to time. Continued use after changes constitutes
              acceptance. Material changes will be communicated via email.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
