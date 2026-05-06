import Stripe from "stripe";
import { getOptionalEnv } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripe) return stripe;

  const key = getOptionalEnv("STRIPE_SECRET_KEY");
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  stripe = new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
  });

  return stripe;
}

export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
}

export const STRIPE_PRICES: Record<string, string> = {
  STUDIO: process.env.STRIPE_STUDIO_PRICE_ID ?? "",
  GROWTH: process.env.STRIPE_GROWTH_PRICE_ID ?? "",
};
