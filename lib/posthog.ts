import posthog from "posthog-js";
import { getOptionalEnv } from "@/lib/env";

export function initPostHog(): void {
  const key = getOptionalEnv("POSTHOG_KEY");

  if (!key || typeof window === "undefined") {
    return;
  }

  posthog.init(key, {
    api_host: getOptionalEnv("POSTHOG_HOST") ?? "https://app.posthog.com",
    capture_pageview: false
  });
}

export { posthog };
