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
      return Boolean(user.email);
    },
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      const agency = user.agencyId
        ? await prisma.agency.findUnique({
            where: { id: user.agencyId },
            select: { slug: true, name: true, brandColor: true }
          })
        : null;

      session.user.id = user.id;
      session.user.role = user.role;
      session.user.agencyId = user.agencyId;
      session.user.agencySlug = agency?.slug ?? null;
      session.user.agencyName = agency?.name ?? null;
      session.user.agencyBrandColor = agency?.brandColor ?? null;
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
