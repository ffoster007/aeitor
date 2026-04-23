export const BILLING_PLANS = [
  {
    id: "FREE",
    name: "Free Tier",
    priceLabel: "$0",
    cadenceLabel: "/month",
    badge: "Current plan",
    tone: "neutral" as const,
    description:
      "For individuals and small teams that are just getting started",
    features: ["Track up to 2 contracts", "Basic overview"],
    vendorLimit: 2,
    csvExport: false,
    stripePriceEnv: null,
  },
  {
    id: "GROWTH",
    name: "Growth",
    priceLabel: "$6",
    cadenceLabel: "/month",
    badge: "Recommended",
    tone: "blue" as const,
    description:
      "For growing teams that need to track more contracts and vendors",
    features: ["Track up to 50 contracts", "CSV exports for reviews"],
    vendorLimit: 50,
    csvExport: true,
    stripePriceEnv: "STRIPE_PRICE_GROWTH_MONTHLY",
  },
  {
    id: "SCALE",
    name: "Scale",
    priceLabel: "$10",
    cadenceLabel: "/month",
    badge: "Business",
    tone: "amber" as const,
    description:
      "For organizations and businesses that need to track unlimited contracts, and get early access to new features.",
    features: [
      "Everything in Growth",
      "Unlimited contracts and vendors",
      "Exclusive early updates",
    ],
    vendorLimit: null,
    csvExport: true,
    stripePriceEnv: "STRIPE_PRICE_SCALE_MONTHLY",
  },
] as const;

export type BillingPlanId = (typeof BILLING_PLANS)[number]["id"];

export function isPaidPlan(plan: BillingPlanId): boolean {
  return plan === "GROWTH" || plan === "SCALE";
}

export function getPlanConfig(plan: BillingPlanId) {
  const found = BILLING_PLANS.find((item) => item.id === plan);
  if (!found) {
    throw new Error(`Unknown billing plan: ${plan}`);
  }
  return found;
}

export function getPlanByPriceId(priceId: string): BillingPlanId | null {
  const growthPrice = process.env.STRIPE_PRICE_GROWTH_MONTHLY;
  const scalePrice = process.env.STRIPE_PRICE_SCALE_MONTHLY;

  if (growthPrice && priceId === growthPrice) return "GROWTH";
  if (scalePrice && priceId === scalePrice) return "SCALE";
  return null;
}

export function getStripePriceIdForPlan(plan: BillingPlanId): string {
  const config = getPlanConfig(plan);
  if (!config.stripePriceEnv) {
    throw new Error("Free plan does not have a Stripe price id.");
  }

  const priceId = process.env[config.stripePriceEnv];
  if (!priceId) {
    throw new Error(`Missing required env var: ${config.stripePriceEnv}`);
  }

  return priceId;
}

export function getVendorLimit(plan: BillingPlanId): number | null {
  return getPlanConfig(plan).vendorLimit;
}

export function canExportCsv(plan: BillingPlanId): boolean {
  return getPlanConfig(plan).csvExport;
}
