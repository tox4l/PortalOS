import { redirect } from "next/navigation";
import Link from "next/link";
import { XCircle } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/invite-tokens";
import { createClientSession } from "@/lib/client-sessions";
import { isDevBypass, getDevPortalClient } from "@/lib/dev-bypass";

type PortalAuthPageProps = {
  params: Promise<{ clientSlug: string }>;
  searchParams: Promise<{ token?: string; email?: string }>;
};

export default async function PortalAuthPage({ params, searchParams }: PortalAuthPageProps) {
  const { clientSlug } = await params;
  const { token, email } = await searchParams;

  if (!token || !email) {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center px-4">
        <div className="surface-panel w-full max-w-[440px] p-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-[14px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)] mx-auto">
            <XCircle aria-hidden="true" className="size-8 text-[var(--gold-muted)]" />
          </div>
          <h1 className="mt-6 font-display text-[30px] font-normal leading-[1.2] tracking-[-0.01em] text-[var(--ink-primary)]">
            Invalid sign-in link
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
            This sign-in link is missing required information. Please request a new magic link.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[var(--border-gold)] bg-[var(--gold-wash)] px-6 text-[14px] font-semibold text-[var(--gold-core)] transition-[background-color,border-color,box-shadow] duration-[200ms] ease-[var(--ease-out)] hover:bg-[var(--gold-dim)] hover:border-[var(--border-gold-hot)] hover:shadow-[var(--glow-gold-sm)]"
            href={`/portal/${clientSlug}/login`}
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (isDevBypass()) {
    const client = getDevPortalClient(clientSlug);
    if (!client) {
      return (
        <div className="flex min-h-[80dvh] flex-col items-center justify-center px-4">
          <div className="surface-panel w-full max-w-[440px] p-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-[14px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)] mx-auto">
              <XCircle aria-hidden="true" className="size-8 text-[var(--gold-muted)]" />
            </div>
            <h1 className="mt-6 font-display text-[30px] font-normal leading-[1.2] tracking-[-0.01em] text-[var(--ink-primary)]">
              Portal not found
            </h1>
            <p className="mt-3 text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
              This portal does not exist. Please check the link or contact your agency.
            </p>
          </div>
        </div>
      );
    }

    await createClientSession({
      clientUserId: "dev-client-user-001",
      clientId: client.id,
      agencyId: "dev-agency-001",
      clientSlug,
      role: "CLIENT_LEAD",
    });

    redirect(`/portal/${clientSlug}`);
  }

  const client = await prisma.client.findUnique({
    where: { portalSlug: clientSlug },
    select: { id: true, agencyId: true },
  });

  if (!client) {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center px-4">
        <div className="surface-panel w-full max-w-[440px] p-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-[14px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)] mx-auto">
            <XCircle aria-hidden="true" className="size-8 text-[var(--gold-muted)]" />
          </div>
          <h1 className="mt-6 font-display text-[30px] font-normal leading-[1.2] tracking-[-0.01em] text-[var(--ink-primary)]">
            Portal not found
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
            The portal you are trying to access does not exist.
          </p>
        </div>
      </div>
    );
  }

  const hashed = await hashToken(token);

  const invitation = await prisma.clientInvitation.findFirst({
    where: {
      token: hashed,
      email,
      clientId: client.id,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!invitation) {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center px-4">
        <div className="surface-panel w-full max-w-[440px] p-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-[14px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)] mx-auto">
            <XCircle aria-hidden="true" className="size-8 text-[var(--gold-muted)]" />
          </div>
          <h1 className="mt-6 font-display text-[30px] font-normal leading-[1.2] tracking-[-0.01em] text-[var(--ink-primary)]">
            Sign-in link expired or invalid
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
            This sign-in link is no longer valid. It may have expired or already been used.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[var(--border-gold)] bg-[var(--gold-wash)] px-6 text-[14px] font-semibold text-[var(--gold-core)] transition-[background-color,border-color,box-shadow] duration-[200ms] ease-[var(--ease-out)] hover:bg-[var(--gold-dim)] hover:border-[var(--border-gold-hot)] hover:shadow-[var(--glow-gold-sm)]"
            href={`/portal/${clientSlug}/login`}
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  // Find or create the client user
  let clientUser = await prisma.clientUser.findFirst({
    where: { email, clientId: client.id },
    select: { id: true, role: true },
  });

  if (!clientUser) {
    clientUser = await prisma.clientUser.create({
      data: {
        email,
        name: email.split("@")[0],
        clientId: client.id,
        agencyId: client.agencyId,
        role: invitation.role,
      },
      select: { id: true, role: true },
    });
  }

  await prisma.clientInvitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date() },
  });

  await prisma.clientUser.update({
    where: { id: clientUser.id },
    data: { lastLoginAt: new Date() },
  });

  await createClientSession({
    clientUserId: clientUser.id,
    clientId: client.id,
    agencyId: client.agencyId,
    clientSlug,
    role: clientUser.role,
  });

  redirect(`/portal/${clientSlug}`);
}
