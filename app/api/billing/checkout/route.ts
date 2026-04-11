import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getStripeClient } from "@/lib/stripe";
import { getStripePriceIdForPlan, isPaidPlan, type BillingPlanId } from "@/lib/billing/plans";

const bodySchema = z.object({
  plan: z.enum(["GROWTH", "SCALE"]),
});

function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

async function ensureStripeCustomer(userId: string, email: string) {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: "FREE",
      status: "CANCELED",
      stripeCustomerId: customer.id,
    },
    update: {
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

export async function POST(request: Request) {
  let user;

  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const plan = parsed.data.plan as BillingPlanId;
  if (!isPaidPlan(plan)) {
    return Response.json({ error: "Only paid plans can be purchased" }, { status: 400 });
  }

  const stripe = getStripeClient();
  const customerId = await ensureStripeCustomer(user.sub, user.email);
  const priceId = getStripePriceIdForPlan(plan);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appBaseUrl()}/dashboard/billing?checkout=success`,
    cancel_url: `${appBaseUrl()}/dashboard/billing?checkout=cancel`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    client_reference_id: user.sub,
    metadata: {
      userId: user.sub,
      plan,
    },
    subscription_data: {
      metadata: {
        userId: user.sub,
        plan,
      },
    },
  });

  return Response.json({ url: session.url });
}
