import { differenceInDays } from "date-fns";

import { prisma } from "@/lib/prisma";
import { sendRenewalAlert, sendWeeklySummary } from "@/lib/email";

export type VendorAlertMode = "alerts" | "weekly" | "both";

export async function runVendorAlertJob(mode: VendorAlertMode) {
  const today = new Date();
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: {
      vendors: { include: { sentAlerts: true } },
      alertSettings: true,
    },
  });

  const results: string[] = [];

  for (const user of users) {
    const settings = user.alertSettings[0];

    if (mode === "alerts" || mode === "both") {
      for (const vendor of user.vendors) {
        const daysLeft = differenceInDays(vendor.endDate, today);
        if (daysLeft < 0) continue;

        const threshold = vendor.noticePeriod;
        const alreadySent = vendor.sentAlerts.some((alert) => alert.daysLeft === threshold);
        if (!alreadySent && daysLeft === threshold) {
          try {
            await sendRenewalAlert(user.email, vendor, daysLeft);
            await prisma.vendorSentAlert.create({
              data: { vendorId: vendor.id, daysLeft: threshold },
            });
            results.push(`Sent ${threshold}d alert for ${vendor.name} to ${user.email}`);
          } catch (err) {
            results.push(`Failed alert for ${vendor.name}: ${String(err)}`);
          }
        }
      }
    }

    if ((mode === "weekly" || mode === "both") && settings?.weeklySummary !== false) {
      try {
        await sendWeeklySummary(user.email, user.vendors);
        results.push(`Sent weekly summary to ${user.email}`);
      } catch (err) {
        results.push(`Failed weekly summary for ${user.email}: ${String(err)}`);
      }
    }
  }

  return results;
}