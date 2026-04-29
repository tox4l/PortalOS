import { signIn } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    check?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const shouldCheckEmail = params?.check === "email";
  const hasError = Boolean(params?.error);

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[var(--bg-void)] text-[var(--ink-primary)]">
      <section className="mx-auto grid min-h-[100dvh] w-full max-w-[1280px] grid-cols-1 items-center gap-16 px-6 py-24 md:grid-cols-[minmax(0,1fr)_420px] md:px-12">
        <div>
          <p className="section-label">Agency sign in</p>
          <h1 className="mt-8 max-w-[760px] font-display text-[clamp(3.25rem,6vw,5.8rem)] font-normal leading-[0.98] tracking-[-0.025em] text-balance">
            Return to the workroom
          </h1>
          <p className="mt-8 max-w-[520px] text-[15px] leading-7 text-[var(--ink-secondary)]">
            Sign in to manage client rooms, project approvals, briefs, and files.
          </p>
        </div>

        <div className="rounded-[10px] border border-[var(--border-default)] border-t-[rgba(255,255,255,0.10)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-sm)]">
          <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] p-6 md:p-8">
            <h2 className="font-display text-[28px] font-normal leading-[1.22] tracking-[-0.01em]">
              Access PortalOS
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-[var(--ink-secondary)]">
              Use Google or request a secure email link.
            </p>

            {shouldCheckEmail ? (
              <div className="mt-6 rounded-[8px] border border-[rgba(212,175,55,0.25)] bg-[var(--gold-100)] px-4 py-3 text-[13px] leading-6 text-[var(--gold-400)]">
                Check your inbox for a sign-in link. It expires shortly.
              </div>
            ) : null}

            {hasError ? (
              <div className="mt-6 rounded-[8px] border border-[rgba(235,87,87,0.25)] bg-[var(--status-danger-bg)] px-4 py-3 text-[13px] leading-6 text-[var(--status-danger-text)]">
                Sign-in failed. Please try again with a valid agency email.
              </div>
            ) : null}

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/app/dashboard" });
              }}
              className="mt-8"
            >
              <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[var(--border-medium)] bg-transparent px-5 text-[14px] font-medium tracking-[0.02em] text-[var(--ink-primary)] transition-colors duration-200 hover:border-[var(--border-strong)] hover:bg-[rgba(255,255,255,0.04)]" type="submit">
                Continue with Google
              </button>
            </form>

            <div className="my-8 flex items-center gap-3 text-[12px] uppercase tracking-[0.06em] text-[var(--ink-tertiary)]">
              <span className="h-px flex-1 bg-[var(--border-default)]" />
              Or
              <span className="h-px flex-1 bg-[var(--border-default)]" />
            </div>

            <form
              action={async (formData) => {
                "use server";
                const email = String(formData.get("email") ?? "");
                await signIn("resend", {
                  email,
                  redirectTo: "/app/dashboard"
                });
              }}
              className="space-y-5"
            >
              <label className="block">
                <span className="block text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--ink-tertiary)]">
                  Work email
                </span>
                <input
                  className="mt-2 min-h-11 w-full rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-sunken)] px-4 text-[15px] text-[var(--ink-primary)] transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold)] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
                  name="email"
                  placeholder="name@agency.com"
                  required
                  type="email"
                />
                <span className="mt-2 block text-[12px] leading-5 text-[var(--ink-tertiary)]">
                  We will send a single-use magic link.
                </span>
              </label>
              <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-transparent bg-[var(--gold-500)] px-5 text-[14px] font-medium tracking-[0.02em] text-[#0A0A0B] shadow-[var(--shadow-gold-sm)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-[var(--gold-600)] hover:shadow-[var(--shadow-gold-md)]" type="submit">
                Send magic link
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
