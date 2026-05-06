import { headers } from "next/headers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function getActionIp(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]!.trim();
    return "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

export async function checkRateLimit(
  route: string,
  config: { windowMs: number; maxRequests: number }
): Promise<void> {
  const ip = await getActionIp();
  const result = await rateLimit(ip, route, config);
  if (!result.allowed) {
    throw new Error(`Too many requests. Try again in ${result.retryAfter} seconds.`);
  }
}
