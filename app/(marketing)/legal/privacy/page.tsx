import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — PortalOS",
  description: "PortalOS privacy policy.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-[14px] text-[var(--ink-tertiary)]">
          Last updated: April 30, 2026
        </p>
        <div className="mt-12 space-y-8 text-[15px] leading-7 text-[var(--ink-secondary)]">
          <section>
            <h2 className="font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]">
              1. Information we collect
            </h2>
            <p className="mt-3">
              PortalOS collects information you provide when creating an account, including your
              name, email address, agency name, and payment details. We also collect usage data to
              improve the service.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]">
              2. How we use your information
            </h2>
            <p className="mt-3">
              We use your information to provide and improve PortalOS, process payments, send
              transactional emails, and communicate with you about your account. We do not sell your
              data.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]">
              3. Data storage and security
            </h2>
            <p className="mt-3">
              Your data is stored on secure servers and transmitted using encryption. We implement
              industry-standard security measures to protect your information. Access to data is
              role-restricted.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]">
              4. Your rights
            </h2>
            <p className="mt-3">
              You may request access to, correction of, or deletion of your personal data at any
              time. Contact us at hello@portalos.tech for data requests.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]">
              5. Contact
            </h2>
            <p className="mt-3">
              For questions about this policy, contact us at hello@portalos.tech.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
