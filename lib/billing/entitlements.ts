import { prisma } from "@/lib/prisma";
import { BILLING_PLANS, canExportCsv, getVendorLimit, type BillingPlanId } from "@/lib/billing/plans";

export interface BillingState {
  plan: BillingPlanId;
  vendorLimit: number | null;
  csvExport: boolean;
  isPaid: boolean;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
}

function normalizePlan(plan: string | null | undefined): BillingPlanId {
  const found = BILLING_PLANS.find((item) => item.id === plan);
  return found ? found.id : "FREE";
}

function isActiveSubscriptionStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return status === "ACTIVE" || status === "TRIALING" || status === "PAST_DUE";
}

export async function getBillingStateForUser(userId: string): Promise<BillingState> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });

  const plan = normalizePlan(subscription?.plan);
  const status = subscription?.status ?? "CANCELED";
  const isActive = isActiveSubscriptionStatus(status);

  const effectivePlan: BillingPlanId = isActive ? plan : "FREE";

  return {
    plan: effectivePlan,
    vendorLimit: getVendorLimit(effectivePlan),
    csvExport: canExportCsv(effectivePlan),
    isPaid: effectivePlan !== "FREE",
    status,
    cancelAtPeriodEnd: Boolean(subscription?.cancelAtPeriodEnd),
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
  };
}

export async function assertCanCreateVendors(userId: string, addCount: number) {
  const billing = await getBillingStateForUser(userId);

  if (billing.vendorLimit === null) {
    return billing;
  }

  const currentCount = await prisma.vendor.count({ where: { userId } });
  const nextCount = currentCount + addCount;

  if (nextCount > billing.vendorLimit) {
    throw new Error(
      `Plan limit reached. ${billing.plan} allows up to ${billing.vendorLimit} vendors. Please upgrade to add more.`,
    );
  }

  return billing;
}
