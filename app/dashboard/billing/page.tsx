import React from 'react';
import Toolbar from '@/components/toolbar/page';
import { getCurrentUser } from '@/lib/session';

const plans = [
  {
    name: 'Free Tier',
    price: '$0',
    cadence: '/month',
    badge: 'Current plan',
    tone: 'neutral',
    features: [
      'Track up to 10 contracts',
      '30-day renewal reminders',
      '2 team members',
      'Basic billing overview',
    ],
  },
  {
    name: 'Growth',
    price: '$10',
    cadence: '/user /month',
    badge: 'Recommended',
    tone: 'blue',
    features: [
      'Unlimited contracts and vendors',
      '90, 60, and 30-day alerts',
      'Owner assignment and audit trail',
      'CSV exports for finance reviews',
    ],
  },
  {
    name: 'Scale',
    price: '$20',
    cadence: '/user /month',
    badge: 'Advanced controls',
    tone: 'amber',
    features: [
      'Everything in Growth',
      'Approval workflows',
      'Priority onboarding support',
      'Quarterly executive spend reports',
    ],
  },
];

export default async function BillingPage() {
  const user = await getCurrentUser();

  return (
    <div className="h-screen flex flex-col">
      <Toolbar user={user} />
      <main className="flex-1 overflow-y-auto bg-[#1a1a1a] text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:px-6">
          <section className="border border-[#2a2a2a] bg-[#202020]">
            <div className="border-b border-[#2a2a2a] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a8a8a]">Billing</p>
              <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-white">Plan selection</h1>
                  <p className="mt-1 text-sm text-[#9f9fa6]">
                    Manage access limits, renewal alerts, and billing features for this workspace.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[#b4b4bb]">
                  <span className="border border-[#323232] bg-[#181818] px-3 py-1.5">Workspace: {user?.username ?? 'Guest workspace'}</span>
                  <span className="border border-[#323232] bg-[#181818] px-3 py-1.5">Current: Free Tier</span>
                  <span className="border border-[#323232] bg-[#181818] px-3 py-1.5">Cycle: Monthly</span>
                </div>
              </div>
            </div>

            <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="divide-y divide-[#2a2a2a]">
                {plans.map((plan) => {
                  const isCurrent = plan.name === 'Free Tier';
                  const isRecommended = plan.tone === 'blue';
                  const toneClasses =
                    plan.tone === 'blue'
                      ? 'border-[#214a63] bg-[#1a2530]'
                      : plan.tone === 'amber'
                        ? 'border-[#4b3522] bg-[#221b16]'
                        : 'border-[#323232] bg-[#181818]';
                  const badgeClasses =
                    plan.tone === 'blue'
                      ? 'text-[#8ed8ff] border-[#214a63] bg-[#13202a]'
                      : plan.tone === 'amber'
                        ? 'text-[#efc089] border-[#4b3522] bg-[#231a14]'
                        : 'text-[#c7c7cc] border-[#3a3a3a] bg-[#202020]';
                  const buttonClasses = isCurrent
                    ? 'border-[#3a3a3a] bg-[#242424] text-[#d4d4d8]'
                    : isRecommended
                      ? 'border-[#2f77a3] bg-[#3c89ff] text-white'
                      : 'border-[#3a3a3a] bg-[#2a2a2a] text-white';

                  return (
                    <article key={plan.name} className="grid gap-4 px-5 py-5 lg:grid-cols-[220px_minmax(0,1fr)_180px] lg:items-start">
                      <div>
                        <div className={`inline-flex border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${badgeClasses}`}>
                          {plan.badge}
                        </div>
                        <h2 className="mt-3 text-xl font-semibold text-white">{plan.name}</h2>
                        <div className="mt-3 flex items-end gap-2">
                          <span className="text-4xl font-semibold leading-none text-white">{plan.price}</span>
                          <span className="pb-1 text-xs text-[#8d8d93]">{plan.cadence}</span>
                        </div>
                      </div>

                      <div className={`border px-4 py-4 ${toneClasses}`}>
                        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[#8d8d93]">Included</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {plan.features.map((feature) => (
                            <div key={feature} className="flex items-start gap-2 text-sm text-[#dfdfe4]">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:items-end">
                        <span className="text-xs uppercase tracking-[0.16em] text-[#7f7f86]">
                          {isCurrent ? 'Active plan' : 'Available'}
                        </span>
                        <button
                          type="button"
                          className={`min-w-[160px] border px-4 py-2.5 text-sm font-medium transition-colors hover:border-[#4b4b4b] cursor-pointer ${buttonClasses}`}
                        >
                          {isCurrent ? 'Current plan' : `Switch to ${plan.name}`}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="border-l border-t border-[#2a2a2a] bg-[#171717] xl:border-t-0">
                <div className="border-b border-[#2a2a2a] px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a8a8a]">Upgrade notes</p>
                </div>

                <div className="space-y-4 px-5 py-5 text-sm text-[#a5a5ad]">
                  <div className="border border-[#2a2a2a] bg-[#1d1d1d] p-4">
                    <p className="text-white">Why teams move to Growth</p>
                    <p className="mt-2 leading-6">
                      It adds multi-window alerts and shared ownership so renewals stop depending on one person remembering dates.
                    </p>
                  </div>

                  <div className="border border-[#2a2a2a] bg-[#1d1d1d] p-4">
                    <p className="text-white">When Scale makes sense</p>
                    <p className="mt-2 leading-6">
                      Choose it when approvals, executive reporting, or cross-team visibility become part of the renewal process.
                    </p>
                  </div>

                  <div className="border border-[#214a63] bg-[#15202a] p-4 text-[#d8efff]">
                    <p className="text-white">Recommendation</p>
                    <p className="mt-2 leading-6">
                      Growth is the best fit once procurement and finance both need access to the same contract timeline.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
