import { z } from "zod";

type EnvKey =
  | "ABLY_API_KEY"
  | "CALENDLY_URL"
  | "DEMO_MODE"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "DEEPSEEK_API_KEY"
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

// ─── Zod validation schema for build-time / startup checks ───

const envSchema = z.object({
  // Required — core infrastructure
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),

  // Required — email (Resend)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  RESEND_FROM_EMAIL: z.string().email("RESEND_FROM_EMAIL must be a valid email"),

  // Required — auth (NextAuth)
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),

  // Required — payments (Stripe)
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),

  // Required — storage (Supabase)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Optional but validated
  DEEPSEEK_API_KEY: z.string().optional(),
  ABLY_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
  CALENDLY_URL: z.string().url().optional(),
  SUPABASE_STORAGE_URL: z.string().url().optional(),
  VELOCITY_AI_INBOX: z.string().optional(),
  DEMO_MODE: z.enum(["true", "false"]).optional(),
  DEV_BYPASS_AUTH: z.enum(["true", "false"]).optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validate all env vars at startup.
 * Call this in instrument.ts or at the top of layout.tsx.
 * Returns the parsed env or throws with all validation errors.
 */
export function validateEnv(): ValidatedEnv {
  const isDev = process.env.NODE_ENV === "development";
  const isBypass = process.env.DEV_BYPASS_AUTH === "true";

  if (isDev && isBypass) {
    // Relaxed validation — only what Next.js itself needs
    const relaxed = z.object({
      DATABASE_URL: z.string().optional(),
      RESEND_API_KEY: z.string().optional(),
      RESEND_FROM_EMAIL: z.string().optional(),
      AUTH_SECRET: z.string().optional(),
      STRIPE_SECRET_KEY: z.string().optional(),
      STRIPE_WEBHOOK_SECRET: z.string().optional(),
      NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
      SUPABASE_URL: z.string().optional(),
      SUPABASE_ANON_KEY: z.string().optional(),
      SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    });
    return relaxed.parse(process.env) as ValidatedEnv;
  }

  return envSchema.parse(process.env);
}
