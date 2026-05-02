/**
 * API route helpers for rate limiting.
 */

import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

/**
 * Extract the client IP from the request.
 * Checks x-forwarded-for, x-real-ip, and connection remote address.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",");
    const first = ips[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

/**
 * Apply rate limiting to an API route. Returns a 429 response if exceeded,
 * or null if the request is allowed.
 */
export function applyRateLimit(
  request: Request,
  route: string,
  config: RateLimitConfig
): NextResponse | null {
  const ip = getClientIp(request);
  const result = rateLimit(ip, route, config);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfter),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}

/**
 * Shared rate limit configurations for API routes.
 */
export const API_RATE_LIMITS = {
  AI_GENERATE: { windowMs: 60 * 1000, maxRequests: 5 },       // 5/min
  AI_SUMMARIZE: { windowMs: 60 * 1000, maxRequests: 10 },     // 10/min
  CONTACT: { windowMs: 60 * 60 * 1000, maxRequests: 3 },      // 3/hr
} as const;
