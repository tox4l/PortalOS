import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getOptionalEnv } from "@/lib/env";

const UPSTASH_URL = getOptionalEnv("UPSTASH_REDIS_REST_URL");
const UPSTASH_TOKEN = getOptionalEnv("UPSTASH_REDIS_REST_TOKEN");

let redis: Redis | null = null;
let upstash: Ratelimit | null = null;

function getUpstash(): Ratelimit | null {
  if (upstash) return upstash;
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;

  try {
    redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
    upstash = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
    });
    return upstash;
  } catch {
    return null;
  }
}

// ─── In-memory fallback (single-instance only, used when Upstash is not configured) ───

const counters = new Map<string, { count: number; resetAt: number }>();

function pruneExpired(): void {
  const now = Date.now();
  for (const [key, value] of counters) {
    if (now >= value.resetAt) counters.delete(key);
  }
}

function inMemoryRateLimit(
  key: string,
  windowMs: number,
  maxRequests: number
): RateLimitResult {
  pruneExpired();
  const now = Date.now();
  const existing = counters.get(key);

  if (!existing || now >= existing.resetAt) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  if (existing.count >= maxRequests) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  existing.count++;
  return { allowed: true, remaining: maxRequests - existing.count, retryAfter: 0 };
}

// ─── Public API ───

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export async function rateLimit(
  ip: string,
  route: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const key = `${ip}:${route}`;
  const rl = getUpstash();

  if (rl) {
    try {
      const result = await rl.limit(key);
      return {
        allowed: result.success,
        remaining: result.remaining,
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      };
    } catch {
      return inMemoryRateLimit(key, options.windowMs, options.maxRequests);
    }
  }

  return inMemoryRateLimit(key, options.windowMs, options.maxRequests);
}

export const RATE_LIMITS = {
  MAGIC_LINK: { windowMs: 15 * 60 * 1000, maxRequests: 3 },
  SIGNIN: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  REGISTER: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  CONTACT: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  CLIENT_INVITE: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
} as const;
