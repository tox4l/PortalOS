import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle, Warning, XCircle } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/invite-tokens";
import { isDevBypass } from "@/lib/dev-bypass";
import { Button } from "@/components/ui/button";

type AcceptInvitePageProps = {
  searchParams: Promise<{ token?: string; email?: string }>;
};

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const { token, email } = await searchParams;

  if (!token || !email) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center px-4">
        <div className="w-full max-w-[420px] text-center space-y-6">
          <div className="flex size-16 items-center justify-center rounded-[10px] bg-[var(--bg-sunken)] mx-auto">
            <XCircle aria-hidden="true" className="size-8 text-[var(--ink-tertiary)]" />
          </div>
          <h1 className="font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
            Invalid invitation link
          </h1>
          <p className="text-[14px] leading-6 text-[var(--ink-secondary)]">
            This invitation link is missing required information. Please ask your team admin to resend the invitation.
          </p>
        </div>
      </div>
    );
  }

  const session = await auth();

  if (!session?.user?.id) {
    const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/accept-invite?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)}`;
    redirect(loginUrl);
  }

  if (isDevBypass()) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center px-4">
        <div className="w-full max-w-[420px] text-center space-y-6">
          <div className="flex size-16 items-center justify-center rounded-[10px] bg-[var(--gold-dim)] mx-auto">
            <CheckCircle aria-hidden="true" className="size-8 text-[var(--gold-core)]" weight="duotone" />
          </div>
          <div>
            <h1 className="font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
              Invitation accepted
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">
              You have joined the team. You now have access to the agency dashboard.
            </p>
          </div>
          <Button asChild>
            <Link href="/app/dashboard">
              Go to dashboard
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const hashed = await hashToken(token);

  const invitation = await prisma.teamInvitation.findFirst({
    where: {
      token: hashed,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      agency: { select: { name: true } },
    },
  });

  if (!invitation) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center px-4">
        <div className="w-full max-w-[420px] text-center space-y-6">
          <div className="flex size-16 items-center justify-center rounded-[10px] bg-[var(--bg-sunken)] mx-auto">
            <Warning aria-hidden="true" className="size-8 text-[var(--ink-tertiary)]" />
          </div>
          <h1 className="font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
            Invitation expired or invalid
          </h1>
          <p className="text-[14px] leading-6 text-[var(--ink-secondary)]">
            This invitation link is no longer valid. It may have expired or already been accepted. Ask your team admin to send a new invitation.
          </p>
        </div>
      </div>
    );
  }

  // Accept the invitation — attach user to agency
  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { agencyId: invitation.agencyId, role: invitation.role },
    }),
    prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4">
      <div className="w-full max-w-[420px] text-center space-y-6">
        <div className="flex size-16 items-center justify-center rounded-[10px] bg-[var(--gold-dim)] mx-auto">
          <CheckCircle aria-hidden="true" className="size-8 text-[var(--gold-core)]" weight="duotone" />
        </div>
        <div>
          <h1 className="font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
            Welcome to {invitation.agency.name}
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">
            Your invitation has been accepted. You now have access to the agency dashboard.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/dashboard">
            Go to dashboard
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
