import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe";
import {
  markSubscriptionAsCanceledByStripeId,
  syncSubscriptionFromStripe,
} from "@/lib/billing/stripe-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return secret;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripe = getStripeClient();
  const subscriptionId = session.subscription;

  if (!subscriptionId || typeof subscriptionId !== "string") {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = session.metadata?.userId ?? session.client_reference_id ?? undefined;

  await syncSubscriptionFromStripe(subscription, userId);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await syncSubscriptionFromStripe(subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await markSubscriptionAsCanceledByStripeId(subscription.id);
}

export async function POST(request: Request) {
  const stripe = getStripeClient();

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, getWebhookSecret());
  } catch {
    return Response.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch {
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
