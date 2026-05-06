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

async function needsOnboarding(request: NextRequest): Promise<boolean> {
  if (!hasSessionCookie(request)) return false;
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    return !session?.user?.agencyId;
  } catch {
    return false;
  }
}

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  if (isStaticRequest(pathname) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";

  // Treat www. as the bare domain internally instead of redirecting.
  // Vercel domain config can cause redirect loops if we issue www→bare redirects
  // while Vercel enforces bare→www, so we silently normalize here.
  const normalizedHost = host.replace(/^www\./, "");
  const agencySlug = getAgencySlugFromHost(normalizedHost);

  if (agencySlug) {
    const rewriteUrl = nextUrl.clone();
    rewriteUrl.searchParams.set("agency", agencySlug);

    // Bypass routes that don't need agency context
    if (pathname.startsWith("/api") || pathname.startsWith("/onboarding") || pathname.startsWith("/accept-invite")) {
      return NextResponse.rewrite(rewriteUrl);
    }

    if (pathname.startsWith("/app")) {
      // Agency dashboard via subdomain — protect with session
      if (!hasSessionCookie(request)) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);
        return NextResponse.redirect(loginUrl);
      }
      if (await needsOnboarding(request)) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
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
        if (await needsOnboarding(request)) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
        return NextResponse.redirect(new URL("/app/dashboard", request.url));
      }
      return NextResponse.rewrite(rewriteUrl);
    }

    // Root or unknown paths — rewrite to client portal landing
    rewriteUrl.pathname = `/portal/${agencySlug}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (isDevBypass()) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Routes that bypass session checks entirely
  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/") ||
      pathname === "/accept-invite" || pathname.startsWith("/accept-invite/")) {
    return NextResponse.next();
  }

  // ---- Portal (tier 3 / client) auth ----
  // /portal/{slug}/* requires a client session; redirect to /portal/{slug}/login, NOT /login.
  // Loop prevention: skip redirect when already on login or auth-callback pages.
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

  if (pathname.startsWith("/app")) {
    if (!hasSessionCookie(request)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
    if (await needsOnboarding(request)) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  if (pathname === "/login" && hasSessionCookie(request)) {
    if (await needsOnboarding(request)) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
