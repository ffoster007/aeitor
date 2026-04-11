import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BILLING_PLANS, type BillingPlanId } from "@/lib/billing/plans";

export type PaidPlan = Exclude<BillingPlanId, "FREE">;

const PAID_PLANS = BILLING_PLANS.filter(
  (plan): plan is (typeof BILLING_PLANS)[number] & { id: PaidPlan } => plan.id !== "FREE",
);

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  loadingPlan: PaidPlan | null;
  onChoosePlan: (plan: PaidPlan) => void;
}

export function UpgradePlanDialog({
  open,
  onOpenChange,
  reason,
  loadingPlan,
  onChoosePlan,
}: UpgradePlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden border-[#3a3329] bg-[#171717] px-6 py-6 text-[#f3efe8] sm:rounded-[28px] md:px-8 md:py-8">
        <DialogHeader className="mb-6 max-w-2xl space-y-4">
          <p
            className="text-[11px] uppercase tracking-[0.28em] text-[#8e887f]"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            Billing upgrade
          </p>
          <DialogTitle
            className="text-4xl leading-tight text-[#f3efe8]"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
          >
            Choose the plan that fits your operating cadence.
          </DialogTitle>
          <DialogDescription
            className="text-sm leading-6 text-[#9d978d]"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            {reason}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 xl:grid-cols-2">
          {PAID_PLANS.map((plan) => {
            const isRecommended = plan.tone === "blue";
            const isLoading = loadingPlan === plan.id;
            const cardStyle = isRecommended
              ? {
                  backgroundColor: "#ece4d6",
                  borderColor: "#d8cab6",
                  color: "#171717",
                  boxShadow: "0 20px 48px rgba(0, 0, 0, 0.18)",
                }
              : {
                  backgroundColor: "#212121",
                  borderColor: "#343434",
                  color: "#f3efe8",
                };
            const mutedText = isRecommended ? "#655d52" : "#9d978d";
            const bodyText = isRecommended ? "#38332d" : "#d9d3ca";
            const buttonStyle = isRecommended
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
                className="flex min-h-[360px] flex-col rounded-[28px] border p-6"
                style={cardStyle}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="text-[11px] uppercase tracking-[0.22em]"
                      style={{ color: mutedText, fontFamily: "'Helvetica Neue', sans-serif" }}
                    >
                      {plan.badge}
                    </p>
                    <h3
                      className="mt-3 text-3xl leading-tight"
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
                    {plan.id === "GROWTH" ? "Most chosen" : "For scale"}
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
                    <p
                      className="pb-1 text-sm"
                      style={{ color: mutedText, fontFamily: "'Helvetica Neue', sans-serif" }}
                    >
                      {plan.cadenceLabel}
                    </p>
                  </div>

                  <p
                    className="mt-4 text-sm leading-6"
                    style={{ color: bodyText, fontFamily: "'Helvetica Neue', sans-serif" }}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: isRecommended ? "#171717" : "#ece4d6" }}
                      />
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: bodyText, fontFamily: "'Helvetica Neue', sans-serif" }}
                      >
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-7 flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  style={buttonStyle}
                  onClick={() => onChoosePlan(plan.id)}
                  disabled={loadingPlan !== null}
                >
                  {isLoading ? "Redirecting..." : `Choose ${plan.name}`}
                </button>
              </article>
            );
          })}
        </div>

        <p
          className="mt-5 text-xs leading-5 text-[#8e887f]"
          style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
        >
          Prices are billed monthly per user.
        </p>
      </DialogContent>
    </Dialog>
  );
}