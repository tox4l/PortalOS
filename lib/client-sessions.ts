import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const CLIENT_SESSION_COOKIE = "portalos-client-session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "fallback-dev-secret-must-be-32-chars"
);

export type ClientSessionPayload = {
  clientUserId: string;
  clientId: string;
  agencyId: string;
  clientSlug: string;
  role: string;
};

function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== "production") return undefined;
  try {
    const hostname = new URL(process.env.APP_URL ?? "https://portalos.tech").hostname;
    const root = hostname.replace(/^www\./, "");
    return root.startsWith("localhost") || root.includes("vercel.app") ? undefined : `.${root}`;
  } catch {
    return ".portalos.tech";
  }
}

export async function createClientSession(
  payload: ClientSessionPayload
): Promise<void> {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(CLIENT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    domain: getCookieDomain(),
  });
}

export async function getClientSession(): Promise<ClientSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as ClientSessionPayload;
  } catch {
    return null;
  }
}

export async function clearClientSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CLIENT_SESSION_COOKIE);
}
