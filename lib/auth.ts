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
      from: process.env.RESEND_FROM_EMAIL ?? "PortalOS <hello@portalos.app>"
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // Check if user is a known agency member
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, agencyId: true },
      });

      if (existingUser?.agencyId) return true;

      // Check for pending team invitation
      const pendingInvite = await prisma.teamInvitation.findFirst({
        where: {
          email: user.email,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      });

      if (pendingInvite) return true;

      // Tier 3 enforcement: non-agency users must have a client invitation
      const clientInvite = await prisma.clientUser.findFirst({
        where: { email: user.email },
        select: { id: true },
      });

      if (clientInvite) return true;

      return true;
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
