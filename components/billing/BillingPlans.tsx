"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { BILLING_PLANS, type BillingPlanId } from "@/lib/billing/plans";
import { Spinner } from "@/components/ui/spinner";
import type { BillingState } from "@/lib/billing/entitlements";

type PaidPlan = Exclude<BillingPlanId, "FREE">;

interface Props {
  billing: BillingState;
}

function BillingPlansContent({ billing }: Props) {
  const searchParams = useSearchParams();
  const [pendingPlan, setPendingPlan] = useState<PaidPlan | null>(null);
  const [portalPending, setPortalPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function startCheckout(plan: PaidPlan) {
    setPendingPlan(plan);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const payload = await response.json().catch(() => null) as { url?: string; error?: string } | null;
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Unable to create checkout session");
      }

      window.location.href = payload.url;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to create checkout session");
      setPendingPlan(null);
    }
  }

  async function openPortal() {
    setPortalPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const payload = await response.json().catch(() => null) as { url?: string; error?: string } | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Unable to open billing portal");
      }

      window.location.href = payload.url;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to open billing portal");
      setPortalPending(false);
    }
  }

  return (
    <>
      {searchParams.get("checkout") === "success" && (
        <div className="mb-4 rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          Checkout completed. Your subscription will be active once Stripe webhook processing finishes.
        </div>
      )}

      {searchParams.get("checkout") === "cancel" && (
        <div className="mb-4 rounded-lg border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
          Checkout was canceled. You can choose a plan again anytime.
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {billing.isPaid && (
        <div className="mb-5 rounded-2xl border border-[#343434] bg-[#202020] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#d9d3ca]">
            Current plan: {billing.plan}
            {billing.currentPeriodEnd ? ` • Renews ${new Date(billing.currentPeriodEnd).toLocaleDateString()}` : ""}
          </p>
          <button
            type="button"
            onClick={openPortal}
            disabled={portalPending || pendingPlan !== null}
            className="rounded-full border border-[#4a4a4a] px-4 py-2 text-sm text-[#f3efe8] hover:bg-[#2b2b2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {portalPending ? (
              <span className="flex items-center gap-2">
                <Spinner size={13} /> Opening portal...
              </span>
            ) : "Manage subscription"}
          </button>
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-3">
        {BILLING_PLANS.map((plan) => {
          const isCurrent = plan.id === billing.plan;
          const isRecommended = plan.tone === "blue";
          const cardStyle = isRecommended
            ? {
                backgroundColor: "#ece4d6",
                borderColor: "#d8cab6",
                color: "#171717",
                boxShadow: "0 20px 48px rgba(0, 0, 0, 0.18)",
              }
            : {
                backgroundColor: "#212121",
                borderColor: "#2f2f2f",
                color: "#f3efe8",
              };
          const mutedText = isRecommended ? "#655d52" : "#9d978d";
          const bodyText = isRecommended ? "#38332d" : "#d9d3ca";
          const buttonStyle = isCurrent
            ? {
                backgroundColor: "transparent",
                borderColor: isRecommended ? "#bba98e" : "#3a3a3a",
                color: isRecommended ? "#38332d" : "#e8e3da",
              }
            : isRecommended
            ? {
                backgroundColor: "#171717",
                borderColor: "#171717",
                color: "#f3efe8",
              }
            : {
                backgroundColor: "#ece4d6",
                borderColor: "#ece4d6",
                color: "#171717",
              };

          return (
            <article
              key={plan.id}
              className="flex flex-col rounded-[28px] border p-6"
              style={cardStyle}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className="text-xs uppercase tracking-[0.22em] mb-3"
                    style={{ color: mutedText, fontFamily: "'Helvetica Neue', sans-serif" }}
                  >
                    {isCurrent ? "Current plan" : plan.badge}
                  </p>
                  <h3
                    className="text-3xl leading-tight"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
                  >
                    {plan.name}
                  </h3>
                </div>

                <span
                  className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
                  style={{
                    borderColor: isRecommended ? "#bba98e" : "#3a3a3a",
                    color: mutedText,
                    fontFamily: "'Helvetica Neue', sans-serif",
                  }}
                >
                  {plan.priceLabel === "$0" ? "Starter" : "Team plan"}
                </span>
              </div>

              <div className="mt-6">
                <div className="flex items-end gap-2">
                  <p
                    className="text-5xl leading-none"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
                  >
                    {plan.priceLabel}
                  </p>
                  <p className="pb-1 text-sm" style={{ color: mutedText, fontFamily: "'Helvetica Neue', sans-serif" }}>
                    {plan.cadenceLabel}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-6" style={{ color: bodyText, fontFamily: "'Helvetica Neue', sans-serif" }}>
                  {plan.description}
                </p>
              </div>

              <div className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: isRecommended ? "#171717" : "#ece4d6" }}
                    />
                    <p className="text-sm leading-relaxed" style={{ color: bodyText, fontFamily: "'Helvetica Neue', sans-serif" }}>
                      {feature}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-7 rounded-full border px-5 py-3 text-sm transition-colors cursor-pointer hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                style={buttonStyle}
                disabled={isCurrent || pendingPlan !== null || portalPending}
                onClick={() => {
                  if (plan.id === "FREE") return;
                  startCheckout(plan.id);
                }}
              >
                {isCurrent
                  ? "Current plan"
                  : pendingPlan === plan.id
                  ? <><Spinner size={13} /> Redirecting...</>
                  : "Choose plan"}
              </button>
            </article>
          );
        })}
      </section>
    </>
  );
}

export default function BillingPlans(props: Props) {
  return (
    <Suspense fallback={null}>
      <BillingPlansContent {...props} />
    </Suspense>
  );
}
