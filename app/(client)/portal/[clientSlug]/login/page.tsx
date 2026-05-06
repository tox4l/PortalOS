import { auth } from "@/lib/auth";
import { ClientLoginForm } from "./client-login-form";

export default async function ClientLoginPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;

  // Detect agency users who land on the client login page
  let isAgencyUser = false;
  try {
    const session = await auth();
    if (session?.user?.agencyId) {
      isAgencyUser = true;
    }
  } catch {
    // auth() may fail in edge cases — treat as non-agency
  }

  return <ClientLoginForm clientSlug={clientSlug} isAgencyUser={isAgencyUser} />;
}
