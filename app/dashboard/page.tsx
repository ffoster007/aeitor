import React from 'react'
import ComponentsPage from '@/components/page'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getBillingStateForUser } from '@/lib/billing/entitlements'

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const rawVendors = user
    ? await prisma.vendor.findMany({
        where: { userId: user.sub },
        orderBy: { endDate: 'asc' },
      })
    : [];

  // Serialize Decimal → number so it can cross the Server→Client boundary
  const vendors = rawVendors.map((v) => ({
    ...v,
    monthlyCost: v.monthlyCost.toNumber(),
  }));
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

  return <ComponentsPage user={user} vendors={vendors} billing={billing} />
}