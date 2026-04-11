import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getPlanByPriceId, type BillingPlanId } from "@/lib/billing/plans";

function mapStripeStatus(status: Stripe.Subscription.Status):
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "UNPAID"
  | "PAUSED" {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "incomplete":
      return "INCOMPLETE";
    case "incomplete_expired":
      return "INCOMPLETE_EXPIRED";
    case "unpaid":
      return "UNPAID";
    case "paused":
      return "PAUSED";
    default:
      return "CANCELED";
  }
}

function extractPlanFromSubscription(subscription: Stripe.Subscription): BillingPlanId {
  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) return "FREE";

  return getPlanByPriceId(priceId) ?? "FREE";
}

function extractPeriodDates(subscription: Stripe.Subscription) {
  const currentItem = subscription.items.data[0];

  return {
    currentPeriodStart: currentItem ? new Date(currentItem.current_period_start * 1000) : null,
    currentPeriodEnd: currentItem ? new Date(currentItem.current_period_end * 1000) : null,
  };
}

export async function syncSubscriptionFromStripe(subscription: Stripe.Subscription, userIdHint?: string) {
  const plan = extractPlanFromSubscription(subscription);
  const status = mapStripeStatus(subscription.status);
  const { currentPeriodStart, currentPeriodEnd } = extractPeriodDates(subscription);
  const stripeCustomerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  const userId =
    userIdHint
    ?? subscription.metadata.userId
    ?? (await prisma.subscription.findUnique({
      where: { stripeCustomerId },
      select: { userId: true },
    }))?.userId;

  if (!userId) {
    throw new Error("Cannot resolve user for Stripe subscription event.");
  }

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      plan,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      plan,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function markSubscriptionAsCanceledByStripeId(stripeSubscriptionId: string) {
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
    select: { userId: true, stripeCustomerId: true },
  });

  if (!existing) return;

  await prisma.subscription.update({
    where: { userId: existing.userId },
    data: {
      plan: "FREE",
      status: "CANCELED",
      stripeSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  });
}
