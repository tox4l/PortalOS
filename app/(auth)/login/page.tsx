import Link from "next/link";
import { signIn } from "@/lib/auth";
import { auth } from "@/lib/auth";

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

  // If the user already has a session but no agency, prompt them to finish
  // onboarding instead of showing the sign-in form.
  const session = await auth();
  const needsOnboarding = session?.user && !session.user.agencyId;

  if (needsOnboarding) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-void)] px-4 py-12">
        <div className="w-full max-w-[28rem] text-center">
          <Link
            className="font-display text-[32px] font-normal tracking-[-0.01em] text-[var(--gold-core)]"
            href="/"
          >
            PortalOS
          </Link>
          <div className="mt-16">
            <h1 className="font-display text-[clamp(2rem,5vw,2.5rem)] font-normal leading-[1.08] text-[var(--ink-primary)]">
              Complete your account setup
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-[var(--ink-secondary)]">
              You are signed in but have not finished setting up your agency.
            </p>
            <Link
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-transparent bg-[var(--gold-core)] px-5 text-[14px] font-medium tracking-[0.02em] text-white shadow-[var(--shadow-sm)] transition-[background-color,box-shadow] duration-200 hover:bg-[var(--gold-mid)] hover:shadow-[var(--shadow-md)]"
              href="/onboarding"
            >
              Continue setup
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-void)] px-4 py-12">
      <div className="w-full max-w-[28rem]">
        <div className="text-center">
          <Link
            className="font-display text-[32px] font-normal tracking-[-0.01em] text-[var(--gold-core)]"
            href="/"
          >
            PortalOS
          </Link>
        </div>

        <div className="mt-16">
          <p className="font-eyebrow text-[var(--gold-core)]">Sign in</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,2.5rem)] font-normal leading-[1.08]">
            Welcome back
          </h1>
        </div>

        <div className="mt-12">
          {shouldCheckEmail ? (
            <div className="rounded-[4px] border border-[var(--border-gold-dim)] bg-[var(--gold-dim)] px-4 py-3 text-[13px] leading-6 text-[var(--gold-bright)]">
              Check your inbox for a sign-in link. It expires shortly.
            </div>
          ) : null}

          {hasError ? (
            <div className="rounded-[4px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[13px] leading-6 text-[var(--danger-text)]">
              Sign-in failed. Please try again with a valid agency email.
            </div>
          ) : null}

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/onboarding" });
            }}
            className="mt-6"
          >
            <button
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 text-[14px] font-medium tracking-[0.02em] text-[var(--ink-primary)] shadow-[var(--shadow-xs)] transition-colors duration-200 hover:border-[var(--border-gold-dim)] hover:bg-[var(--gold-wash)] hover:shadow-[var(--shadow-sm)]"
              type="submit"
            >
              <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="my-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[var(--ink-tertiary)]">
            <span className="h-px flex-1 bg-[var(--border-hairline)]" />
            Or
            <span className="h-px flex-1 bg-[var(--border-hairline)]" />
          </div>

          <form
            action={async (formData) => {
              "use server";
              const email = String(formData.get("email") ?? "");
              await signIn("resend", {
                email,
                redirectTo: "/onboarding"
              });
            }}
            className="space-y-6"
          >
            <label className="block">
              <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--ink-tertiary)]">
                Work email
              </span>
              <input
                className="mt-2 w-full border-b-2 border-[var(--border-hairline)] bg-transparent py-3 text-[1.0625rem] text-[var(--ink-primary)] transition-[border-color] duration-200 placeholder:text-[var(--ink-tertiary)] focus:border-[var(--gold-core)] focus:outline-none"
                name="email"
                placeholder="name@agency.com"
                required
                type="email"
              />
              <span className="mt-2 block text-[12px] leading-5 text-[var(--ink-tertiary)]">
                We will send a single-use magic link.
              </span>
            </label>
            <button
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-transparent bg-[var(--gold-core)] px-5 text-[14px] font-medium tracking-[0.02em] text-white shadow-[var(--shadow-sm)] transition-[background-color,box-shadow] duration-200 hover:bg-[var(--gold-mid)] hover:shadow-[var(--shadow-md)]"
              type="submit"
            >
              Send magic link
            </button>
          </form>

          <p className="mt-10 text-center text-[14px] text-[var(--ink-tertiary)]">
            New here?{" "}
            <Link className="font-medium text-[var(--gold-core)] transition-colors hover:text-[var(--gold-mid)]" href="/onboarding">
              Start the 3-minute setup
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
