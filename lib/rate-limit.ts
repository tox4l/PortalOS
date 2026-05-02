/**
 * In-memory rate limiter.
 * Works per-instance only. Replace with Upstash Redis post-launch
 * for multi-instance deployments.
 */

const counters = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

function getKey(ip: string, route: string): string {
  return `${ip}:${route}`;
}

function pruneExpired(): void {
  const now = Date.now();
  for (const [key, value] of counters) {
    if (now >= value.resetAt) {
      counters.delete(key);
    }
  }
}

// Prune every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(pruneExpired, 60_000);
}

export function rateLimit(
  ip: string,
  route: string,
  options: RateLimitOptions
): RateLimitResult {
  const key = getKey(ip, route);
  const now = Date.now();
  const existing = counters.get(key);

  if (!existing || now >= existing.resetAt) {
    counters.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.maxRequests - 1, retryAfter: 0 };
  }

  if (existing.count >= options.maxRequests) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - existing.count,
    retryAfter: 0,
  };
}

/**
 * Rate limits by route:
 * - auth/magic-link:  3 per IP per 15 min
 * - auth/signin:     10 per IP per 15 min
 * - auth/register:    5 per IP per 15 min
 * - contact:          3 per IP per hour
 * - client-invite:   10 per agency per hour (caller provides custom key)
 */

export const RATE_LIMITS = {
  MAGIC_LINK: { windowMs: 15 * 60 * 1000, maxRequests: 3 },
  SIGNIN: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  REGISTER: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  CONTACT: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  CLIENT_INVITE: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
} as const;
