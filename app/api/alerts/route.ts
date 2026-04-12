import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";
import { sendRenewalAlert, sendWeeklySummary } from "@/lib/email";

// Called by a cron job (e.g., Vercel Cron, GitHub Actions) with CRON_SECRET header
export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = new URL(req.url).searchParams.get("mode") ?? "alerts";
  const today = new Date();

  // Fetch all users with their vendors and alert settings
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
    const alertDays = settings?.alertDays ?? [90, 60, 30];

    if (mode === "alerts" || mode === "both") {
      for (const vendor of user.vendors) {
        const daysLeft = differenceInDays(vendor.endDate, today);
        if (daysLeft < 0) continue; // already expired

        for (const threshold of alertDays) {
          const alreadySent = vendor.sentAlerts.some(
            (a) => a.daysLeft === threshold,
          );
          if (!alreadySent && daysLeft <= threshold) {
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

  return NextResponse.json({ ok: true, results });
}
