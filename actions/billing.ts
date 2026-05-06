"use server";

import { createAction, type ActionResult } from "@/actions/safe-action";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

const BASE_URL = process.env.APP_URL ?? "https://portalos.tech";

export const createCheckoutSession = createAction<"STUDIO" | "GROWTH", { url: string }>({
  name: "createCheckoutSession",
  async handler(plan, ctx) {
    const stripe = getStripe();

    const agency = await prisma.agency.findUnique({
      where: { id: ctx.agencyId },
      select: { stripeCustomerId: true },
    });

    let customerId: string | undefined = agency?.stripeCustomerId ?? undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { agencyId: ctx.agencyId },
      });
      customerId = customer.id;
      await prisma.agency.update({
        where: { id: ctx.agencyId },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = process.env[`STRIPE_${plan}_PRICE_ID`] ?? "";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${BASE_URL}/app/settings/billing?success=true`,
      cancel_url: `${BASE_URL}/app/settings/billing?canceled=true`,
      metadata: { agencyId: ctx.agencyId, plan },
    });

    return { url: session.url ?? "" };
  },
});

export const createPortalSession = createAction<void, { url: string }>({
  name: "createPortalSession",
  async handler(_input, ctx) {
    const stripe = getStripe();

    const agency = await prisma.agency.findUnique({
      where: { id: ctx.agencyId },
      select: { stripeCustomerId: true },
    });

    if (!agency?.stripeCustomerId) {
      throw new Error("No billing account found.");
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: agency.stripeCustomerId,
      return_url: `${BASE_URL}/app/settings/billing`,
    });

    return { url: portal.url };
  },
});

export const getSubscription = createAction<void, {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
} | null>({
  name: "getSubscription",
  async handler(_input, ctx) {
    const agency = await prisma.agency.findUnique({
      where: { id: ctx.agencyId },
      select: { plan: true, stripeSubscriptionId: true, stripeSubscriptionStatus: true, stripeCurrentPeriodEnd: true },
    });

    if (!agency) return null;

    return {
      plan: agency.plan,
      status: agency.stripeSubscriptionStatus ?? "inactive",
      currentPeriodEnd: agency.stripeCurrentPeriodEnd?.toISOString() ?? null,
    };
  },
});

export type { ActionResult };
