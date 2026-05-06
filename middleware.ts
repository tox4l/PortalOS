import { NextResponse, type NextRequest } from "next/server";
import { isDevBypass } from "@/lib/dev-bypass";

const PUBLIC_FILE = /\.(.*)$/;
const APP_HOSTS = new Set([
  "localhost",
  "localhost:3000",
  "127.0.0.1",
  "127.0.0.1:3000",
  "portalos.tech",
  "www.portalos.tech"
]);

const PREVIEW_DOMAINS = [".vercel.app"];

function isStaticRequest(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    PUBLIC_FILE.test(pathname)
  );
}

function getAgencySlugFromHost(host: string): string | null {
  const lowerHost = host.toLowerCase();
  const normalizedHost = lowerHost.split(":")[0];

  if (APP_HOSTS.has(lowerHost) || APP_HOSTS.has(normalizedHost)) {
    return null;
  }

  if (PREVIEW_DOMAINS.some((domain) => normalizedHost.endsWith(domain))) {
    return null;
  }

  if (normalizedHost.endsWith(".localhost")) {
    const slug = normalizedHost.replace(".localhost", "");
    return slug && slug !== "www" ? slug : null;
  }

  if (normalizedHost.endsWith(".portalos.tech")) {
    const [subdomain] = normalizedHost.split(".");
    return subdomain && subdomain !== "www" ? subdomain : null;
  }

  return normalizedHost.includes(".") ? normalizedHost : null;
}

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token")
  );
}

// NOTE: Onboarding completion checks happen at the page level (every /app page
// checks session.user.agencyId and redirects to /onboarding if missing).
// We do NOT import @/lib/auth in middleware because it transitively depends on
// pg-native, which is unsupported in Vercel Edge Functions.

export default function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  if (isStaticRequest(pathname) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";

  // Treat www. as the bare domain internally — no redirect issued.
  const normalizedHost = host.replace(/^www\./, "");
  const agencySlug = getAgencySlugFromHost(normalizedHost);

  // ─── Subdomain routing ───
  if (agencySlug) {
    const rewriteUrl = nextUrl.clone();
    rewriteUrl.searchParams.set("agency", agencySlug);

    if (pathname.startsWith("/api") || pathname.startsWith("/onboarding") || pathname.startsWith("/accept-invite")) {
      return NextResponse.rewrite(rewriteUrl);
    }

    if (pathname.startsWith("/app")) {
      if (!hasSessionCookie(request)) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.rewrite(rewriteUrl);
    }

    if (pathname.startsWith("/portal")) {
      const slug = pathname.split("/")[2];
      if (slug && !pathname.startsWith(`/portal/${slug}/login`) && !pathname.startsWith(`/portal/${slug}/auth/`)) {
        if (!request.cookies.has("portalos-client-session")) {
          const loginUrl = new URL(`/portal/${slug}/login`, request.url);
          loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);
          return NextResponse.redirect(loginUrl);
        }
      }
      return NextResponse.rewrite(rewriteUrl);
    }

    if (pathname === "/login") {
      if (hasSessionCookie(request)) {
        return NextResponse.redirect(new URL("/app/dashboard", request.url));
      }
      return NextResponse.rewrite(rewriteUrl);
    }

    rewriteUrl.pathname = `/portal/${agencySlug}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // ─── Bare domain routing ───

  if (isDevBypass()) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/") ||
      pathname === "/accept-invite" || pathname.startsWith("/accept-invite/")) {
    return NextResponse.next();
  }

  // Portal auth (client tier)
  if (pathname.startsWith("/portal/")) {
    const slug = pathname.split("/")[2];
    if (slug &&
        !pathname.startsWith(`/portal/${slug}/login`) &&
        !pathname.startsWith(`/portal/${slug}/auth/`)) {
      if (!request.cookies.has("portalos-client-session")) {
        const loginUrl = new URL(`/portal/${slug}/login`, request.url);
        loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Agency app auth
  if (pathname.startsWith("/app")) {
    if (!hasSessionCookie(request)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Login page: if already signed in, go to dashboard
  if (pathname === "/login" && hasSessionCookie(request)) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
