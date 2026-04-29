type EnvKey =
  | "ABLY_API_KEY"
  | "CALENDLY_URL"
  | "DEMO_MODE"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "OPENAI_API_KEY"
  | "POSTHOG_HOST"
  | "POSTHOG_KEY"
  | "RESEND_API_KEY"
  | "RESEND_FROM_EMAIL"
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_STORAGE_URL"
  | "SUPABASE_URL"
  | "VELOCITY_AI_INBOX";

export function getOptionalEnv(key: EnvKey): string | undefined {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value : undefined;
}

export function requireEnv(key: EnvKey): string {
  const value = getOptionalEnv(key);

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function isDemoMode(): boolean {
  return getOptionalEnv("DEMO_MODE") === "true";
}
