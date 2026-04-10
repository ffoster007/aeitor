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
    description: 'For small teams getting out of spreadsheets and starting with a shared renewal view.',
    features: [
      'Track up to 2 contracts',
      '30-day renewal reminders',
      'Basic billing overview',
    ],
  },
  {
    name: 'Growth',
    price: '$10',
    cadence: '/user /month',
    badge: 'Recommended',
    tone: 'blue',
    description: 'For teams that need earlier alerts, shared ownership, and cleaner billing decisions.',
    features: [
      'Track up to 50 contracts',
      '90, 60, and 30-day alerts',
      'CSV exports for finance reviews',
    ],
  },
  {
    name: 'Scale',
    price: '$20',
    cadence: '/user /month',
    badge: 'Advanced controls',
    tone: 'amber',
    description: 'For larger organizations that need approvals, reporting, and stronger operating controls.',
    features: [
      'Unlimited contracts and vendors',
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
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 lg:px-6">

          <section className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.name === 'Free Tier';
              const isRecommended = plan.tone === 'blue';
              const cardStyle = isRecommended
                ? {
                    backgroundColor: '#ece4d6',
                    borderColor: '#d8cab6',
                    color: '#171717',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.18)',
                  }
                : {
                    backgroundColor: '#212121',
                    borderColor: '#2f2f2f',
                    color: '#f3efe8',
                  };
              const mutedText = isRecommended ? '#655d52' : '#9d978d';
              const bodyText = isRecommended ? '#38332d' : '#d9d3ca';
              const buttonStyle = isCurrent
                ? {
                    backgroundColor: 'transparent',
                    borderColor: isRecommended ? '#bba98e' : '#3a3a3a',
                    color: isRecommended ? '#38332d' : '#e8e3da',
                  }
                : isRecommended
                  ? {
                      backgroundColor: '#171717',
                      borderColor: '#171717',
                      color: '#f3efe8',
                    }
                  : {
                      backgroundColor: '#ece4d6',
                      borderColor: '#ece4d6',
                      color: '#171717',
                    };

              return (
                  <article
                    key={plan.name}
                    className="flex flex-col rounded-[28px] border p-6"
                    style={cardStyle}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className="text-xs uppercase tracking-[0.22em] mb-3"
                          style={{ color: mutedText, fontFamily: "'Helvetica Neue', sans-serif" }}
                        >
                          {plan.badge}
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
                          borderColor: isRecommended ? '#bba98e' : '#3a3a3a',
                          color: mutedText,
                          fontFamily: "'Helvetica Neue', sans-serif",
                        }}
                      >
                        {plan.price === '$0' ? 'Starter' : 'Team plan'}
                      </span>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-end gap-2">
                        <p
                          className="text-5xl leading-none"
                          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
                        >
                          {plan.price}
                        </p>
                        <p className="pb-1 text-sm" style={{ color: mutedText, fontFamily: "'Helvetica Neue', sans-serif" }}>
                          {plan.cadence}
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
                            style={{ backgroundColor: isRecommended ? '#171717' : '#ece4d6' }}
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
                    >
                      {isCurrent ? 'Current plan' : 'Choose plan'}
                    </button>
                  </article>
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
}
