import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { applyRateLimit, API_RATE_LIMITS } from "@/lib/api-rate-limit";

/**
 * Strip query-string and fragment from a URL to avoid logging tokens, session IDs,
 * or other sensitive data that may appear in the error-reporting URL field.
 */
function sanitizeUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string" || raw.length === 0) return undefined;
  try {
    const url = new URL(raw, "https://localhost");
    url.search = "";
    url.hash = "";
    return url.href;
  } catch {
    return raw.slice(0, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const limited = await applyRateLimit(request, "monitoring:error", { windowMs: 60 * 1000, maxRequests: 30 });
    if (limited) return limited;

    const body = await request.json();

    if (!body || typeof body.message !== "string" || body.message.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    logger.error(body.message.slice(0, 5000), {
      source: "client",
      stack: typeof body.stack === "string" ? body.stack.slice(0, 2000) : undefined,
      url: sanitizeUrl(body.url),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
