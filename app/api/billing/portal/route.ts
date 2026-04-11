import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getStripeClient } from "@/lib/stripe";

function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST() {
  let user;

  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.sub },
    select: { stripeCustomerId: true },
  });

  if (!subscription?.stripeCustomerId) {
    return Response.json({ error: "No Stripe customer found for user" }, { status: 400 });
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${appBaseUrl()}/dashboard/billing`,
  });

  return Response.json({ url: session.url });
}
