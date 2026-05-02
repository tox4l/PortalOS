import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseClient } from "@/utils/supabase/middleware";

const PUBLIC_FILE = /\.(.*)$/;
const APP_HOSTS = new Set([
  "localhost",
  "localhost:3000",
  "127.0.0.1",
  "127.0.0.1:3000",
  "portalos.app",
  "www.portalos.app"
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

  if (normalizedHost.endsWith(".portalos.app")) {
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

function isDevBypass(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.DEV_BYPASS_AUTH === "true";
}

function withSupabaseCookies(
  response: NextResponse,
  supabaseResponse: NextResponse
): NextResponse {
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value);
  });
  return response;
}

export default function middleware(request: NextRequest) {
  // Initialize Supabase response — this wires up cookie refresh for the
  // Supabase SSR client so that any auth token refresh propagates to the
  // outgoing response automatically.
  const supabaseResponse = createSupabaseClient(request);

  const { nextUrl } = request;
  const { pathname } = nextUrl;

  if (isStaticRequest(pathname) || pathname.startsWith("/api/auth")) {
    return supabaseResponse;
  }

  const host = request.headers.get("host") ?? "";
  const agencySlug = getAgencySlugFromHost(host);

  if (isDevBypass() && pathname === "/portal") {
    return withSupabaseCookies(
      NextResponse.redirect(new URL("/demo/client", request.url)),
      supabaseResponse
    );
  }

  if (agencySlug && !pathname.startsWith("/portal") && !pathname.startsWith("/api")) {
    const rewriteUrl = nextUrl.clone();
    rewriteUrl.pathname = `/portal/${agencySlug}${pathname === "/" ? "" : pathname}`;
    rewriteUrl.searchParams.set("agency", agencySlug);
    return withSupabaseCookies(NextResponse.rewrite(rewriteUrl), supabaseResponse);
  }

  if (isDevBypass()) {
    if (pathname === "/login") {
      return withSupabaseCookies(
        NextResponse.redirect(new URL("/app/dashboard", request.url)),
        supabaseResponse
      );
    }
    return supabaseResponse;
  }

  if (pathname.startsWith("/app")) {
    if (!hasSessionCookie(request)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);
      return withSupabaseCookies(NextResponse.redirect(loginUrl), supabaseResponse);
    }
  }

  if (pathname === "/login" && hasSessionCookie(request)) {
    return withSupabaseCookies(
      NextResponse.redirect(new URL("/app/dashboard", request.url)),
      supabaseResponse
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
