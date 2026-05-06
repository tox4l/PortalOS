import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    let report: unknown;
    try {
      report = JSON.parse(text);
    } catch {
      // Ignore malformed JSON — CSP reports are best-effort
      return NextResponse.json({ ok: true });
    }

    const cspReport = (report as Record<string, unknown>)["csp-report"]
      ?? (report as Record<string, unknown>)["report"];

    if (cspReport) {
      logger.warn("CSP violation", {
        source: "csp-report",
        blockedUri: (cspReport as Record<string, unknown>)["blocked-uri"],
        violatedDirective: (cspReport as Record<string, unknown>)["violated-directive"],
        originalPolicy: (cspReport as Record<string, unknown>)["original-policy"],
        userAgent: request.headers.get("user-agent") ?? undefined,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
