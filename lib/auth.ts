import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/db";

const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?check=email",
    error: "/login"
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: false
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY ?? "",
      from: process.env.RESEND_FROM_EMAIL ?? "PortalOS <hello@portalos.tech>"
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, agencyId: true, createdAt: true },
      });

      // Agency member — allow
      if (existingUser?.agencyId) return true;

      // Pending team invitation — allow
      const pendingInvite = await prisma.teamInvitation.findFirst({
        where: {
          email: user.email,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      });
      if (pendingInvite) return true;

      // Client portal member — allow
      const clientUser = await prisma.clientUser.findFirst({
        where: { email: user.email },
        select: { id: true },
      });
      if (clientUser) return true;

      // Brand-new user — no record at all, allow onboarding
      if (!existingUser) return true;

      // Record was just created by the PrismaAdapter during this sign-in flow.
      // Adapter creates the user before signIn runs, so a new OAuth/magic-link
      // user already has a row (with no agency). Allow if created in the last
      // 10 seconds so they can proceed to onboarding.
      const JUST_CREATED_MS = 10_000;
      if (Date.now() - existingUser.createdAt.getTime() < JUST_CREATED_MS) return true;

      // Stale record with no agency, no invitation, no client membership — deny
      return false;
    },
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      // Auto-attach pending team invitation if user just signed in
      if (!user.agencyId && user.email) {
        const pendingInvite = await prisma.teamInvitation.findFirst({
          where: {
            email: user.email,
            acceptedAt: null,
            expiresAt: { gt: new Date() },
          },
        });

        if (pendingInvite) {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: user.id as string },
              data: { agencyId: pendingInvite.agencyId, role: pendingInvite.role },
            }),
            prisma.teamInvitation.update({
              where: { id: pendingInvite.id },
              data: { acceptedAt: new Date() },
            }),
          ]);

          // Re-fetch user with updated agency
          const updatedUser = await prisma.user.findUnique({
            where: { id: user.id as string },
            select: { agencyId: true, role: true },
          });
          if (updatedUser) {
            user.agencyId = updatedUser.agencyId;
            user.role = updatedUser.role;
          }
        }
      }

      const agency = user.agencyId
        ? await prisma.agency.findUnique({
            where: { id: user.agencyId },
            select: { slug: true, name: true, brandColor: true, plan: true }
          })
        : null;

      session.user.id = user.id;
      session.user.role = user.role;
      session.user.agencyId = user.agencyId;
      session.user.agencySlug = agency?.slug ?? null;
      session.user.agencyName = agency?.name ?? null;
      session.user.agencyBrandColor = agency?.brandColor ?? null;
      session.user.agencyPlan = agency?.plan ?? null;
      session.user.demoLocked = user.demoLocked;

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return `${baseUrl}/app/dashboard`;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
