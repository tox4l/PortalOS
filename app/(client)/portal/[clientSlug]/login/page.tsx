"use client";

import { Suspense, use, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, EnvelopeSimple, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requestMagicLinkAction } from "@/actions/client-auth";

function LoginForm({ clientSlug }: { clientSlug: string }) {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  const authErrorMessages: Record<string, string> = {
    "invalid-link": "This sign-in link is missing required information. Please request a new magic link.",
    "portal-not-found": "The portal you are trying to access does not exist.",
    "expired": "This sign-in link is no longer valid. It may have expired or already been used.",
  };

  const [state, dispatch] = useActionState(
    (_prevState: { success: boolean; error?: string; sent?: boolean }, formData: FormData) =>
      requestMagicLinkAction(clientSlug, { success: false }, formData),
    { success: false }
  );

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center px-5">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="text-center">
          <Link
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink-tertiary)] transition-colors duration-[180ms] ease-[var(--ease-out)] hover:text-[var(--gold-core)]"
            href="/"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Back to home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-[2rem]">
              Welcome to your portal
            </CardTitle>
            <CardDescription className="text-center text-[15px]">
              Enter your email and we will send you a magic link to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="mb-6 flex items-start gap-3 rounded-[8px] border border-[var(--border-danger)] bg-[var(--danger-bg)] p-4 text-left">
                <WarningCircle aria-hidden="true" className="size-5 shrink-0 text-[var(--danger-text)]" />
                <p className="text-[14px] leading-[1.5] text-[var(--danger-text)]">
                  {authErrorMessages[authError] ?? "An unexpected error occurred. Please try again."}
                </p>
              </div>
            )}
            {state?.data?.sent ? (
              <div className="flex flex-col items-center gap-5 py-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-[14px] border border-[var(--border-gold)] bg-[var(--gold-wash)] shadow-[var(--inset-gold)]">
                  <EnvelopeSimple aria-hidden="true" className="size-8 text-[var(--gold-core)]" weight="duotone" />
                </div>
                <div>
                  <p className="font-display text-[28px] font-normal leading-[1.2] text-[var(--ink-primary)]">
                    Magic link sent
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
                    Check your email for a sign-in link. It expires in 7 days.
                  </p>
                </div>
              </div>
            ) : (
              <form action={dispatch} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email address</Label>
                  <Input
                    id="client-email"
                    name="email"
                    placeholder="you@company.com"
                    type="email"
                    required
                  />
                </div>
                {state?.error && (
                  <p className="text-[13px] leading-5 text-[var(--danger-text)]">{state.error}</p>
                )}
                <Button className="w-full" size="lg" type="submit">
                  <EnvelopeSimple aria-hidden="true" className="size-4" />
                  Send magic link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-[13px] text-[var(--ink-tertiary)]">
          Powered by PortalOS, a secure client portal for your agency projects
        </p>
      </div>
    </div>
  );
}

export default function ClientLoginPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = use(params);

  return (
    <Suspense fallback={null}>
      <LoginForm clientSlug={clientSlug} />
    </Suspense>
  );
}
