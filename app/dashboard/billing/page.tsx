import React from 'react';
import Toolbar from '@/components/toolbar/page';
import { getCurrentUser } from '@/lib/session';
import { getBillingStateForUser } from '@/lib/billing/entitlements';
import BillingPlans from '@/components/billing/BillingPlans';

export default async function BillingPage() {
  const user = await getCurrentUser();
  const billing = user
    ? await getBillingStateForUser(user.sub)
    : {
        plan: 'FREE' as const,
        vendorLimit: 2,
        csvExport: false,
        isPaid: false,
        status: 'CANCELED',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
      };

  return (
    <div className="h-screen flex flex-col">
      <Toolbar user={user} />
      <main className="flex-1 overflow-y-auto bg-[var(--surface-0)] text-[var(--text-primary)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 lg:px-6">
          <BillingPlans billing={billing} />
        </div>
      </main>
    </div>
  );
}
