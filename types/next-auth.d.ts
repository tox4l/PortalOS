import type { DefaultSession } from "next-auth";
import type { UserRole, Plan } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      agencyId: string | null;
      agencySlug: string | null;
      agencyName: string | null;
      agencyBrandColor: string | null;
      agencyPlan: Plan | null;
      demoLocked: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    agencyId: string | null;
    demoLocked: boolean;
  }
}
