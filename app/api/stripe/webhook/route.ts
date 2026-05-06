import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * In-memory deduplication set for processed Stripe event IDs.
 * Stripe may deliver the same event multiple times (at-least-once delivery).
 * Entries expire after 60 minutes to prevent unbounded memory growth.
 *
 * NOTE: For production deployments with multiple instances, replace this with
 * a DB-backed idempotency store (e.g., a `webhook_events` table with a unique
 * constraint on `stripe_event_id`).
 */
const processedEvents = new Map<string, number>();
const IDEMPOTENCY_TTL_MS = 60 * 60 * 1000; // 1 hour

function hasBeenProcessed(eventId: string): boolean {
  const ts = processedEvents.get(eventId);
  if (ts === undefined) return false;
  if (Date.now() - ts > IDEMPOTENCY_TTL_MS) {
    processedEvents.delete(eventId);
    return false;
  }
  return true;
}

function markProcessed(eventId: string): void {
  processedEvents.set(eventId, Date.now());
}

// Periodic cleanup of expired entries (runs at most once every 5 minutes)
let lastCleanup = 0;
function pruneExpired(): void {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, ts] of processedEvents) {
    if (now - ts > IDEMPOTENCY_TTL_MS) {
      processedEvents.delete(key);
    }
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature") ?? "";

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: skip if this event was already processed
  pruneExpired();
  if (hasBeenProcessed(event.id)) {
    logger.debug("Skipping already-processed webhook event", { eventId: event.id, type: event.type });
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const agencyId = session.metadata?.agencyId;
        const plan = session.metadata?.plan;
        const subscriptionId = session.subscription as string;

        if (agencyId && plan && subscriptionId) {
          await prisma.agency.update({
            where: { id: agencyId },
            data: {
              plan: plan as "STUDIO" | "GROWTH",
              stripeSubscriptionId: subscriptionId,
              stripeSubscriptionStatus: "active",
            },
          });
          logger.info("Subscription activated", { agencyId, plan });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as unknown as { id: string; status: string; current_period_end: number };
        const agency = await prisma.agency.findFirst({
          where: { stripeSubscriptionId: sub.id },
          select: { id: true },
        });

        if (agency) {
          await prisma.agency.update({
            where: { id: agency.id },
            data: {
              stripeSubscriptionStatus: sub.status,
              stripeCurrentPeriodEnd: new Date((sub.current_period_end ?? 0) * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as unknown as { id: string };
        const agency = await prisma.agency.findFirst({
          where: { stripeSubscriptionId: sub.id },
          select: { id: true },
        });

        if (agency) {
          await prisma.agency.update({
            where: { id: agency.id },
            data: {
              plan: "STUDIO",
              stripeSubscriptionStatus: "canceled",
              stripeSubscriptionId: null,
            },
          });
          logger.info("Subscription canceled", { agencyId: agency.id });
        }
        break;
      }
    }

    // Mark as processed only after successful handling
    markProcessed(event.id);
  } catch (error) {
    logger.error("Webhook handler error", {
      error: error instanceof Error ? error.message : String(error),
      eventType: event.type,
      eventId: event.id,
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
