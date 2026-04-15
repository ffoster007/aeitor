"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { assertCanCreateVendors, getBillingStateForUser } from "@/lib/billing/entitlements";
import { revalidatePath } from "next/cache";
import { DEFAULT_ALERT_DAYS, normalizeAlertDays } from "@/lib/vendor-alerts";

export interface VendorFormData {
  name: string;
  endDate: string;        // ISO date string
  noticePeriod: number;   // days
  monthlyCost: number;
}

export async function getVendors() {
  const user = await requireUser();
  return prisma.vendor.findMany({
    where: { userId: user.sub },
    orderBy: { endDate: "asc" },
  });
}

export async function createVendor(data: VendorFormData) {
  const user = await requireUser();

  await assertCanCreateVendors(user.sub, 1);

  await prisma.vendor.create({
    data: {
      name: data.name.trim(),
      endDate: new Date(data.endDate),
      noticePeriod: data.noticePeriod,
      monthlyCost: data.monthlyCost,
      userId: user.sub,
    },
  });

  revalidatePath("/dashboard");
}

export async function updateVendor(id: string, data: VendorFormData) {
  const user = await requireUser();

  // Check ownership
  const existing = await prisma.vendor.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.sub) {
    throw new Error("Vendor not found");
  }

  // Clear sent alerts when end date changes (new renewal cycle)
  if (existing.endDate.toISOString() !== new Date(data.endDate).toISOString()) {
    await prisma.vendorSentAlert.deleteMany({ where: { vendorId: id } });
  }

  await prisma.vendor.update({
    where: { id },
    data: {
      name: data.name.trim(),
      endDate: new Date(data.endDate),
      noticePeriod: data.noticePeriod,
      monthlyCost: data.monthlyCost,
    },
  });

  revalidatePath("/dashboard");
}

export async function deleteVendor(id: string) {
  const user = await requireUser();

  const existing = await prisma.vendor.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.sub) {
    throw new Error("Vendor not found");
  }

  await prisma.vendor.delete({ where: { id } });
  revalidatePath("/dashboard");
}

export async function importVendorsCSV(rows: VendorFormData[]) {
  const user = await requireUser();

  const data = rows
    .filter((r) => r.name && r.endDate)
    .map((r) => ({
      name: r.name.trim(),
      endDate: new Date(r.endDate),
      noticePeriod: Number(r.noticePeriod) || 30,
      monthlyCost: Number(r.monthlyCost) || 0,
      userId: user.sub,
    }));

  if (data.length > 0) {
    await assertCanCreateVendors(user.sub, data.length);
  }

  await prisma.vendor.createMany({ data });
  revalidatePath("/dashboard");
}

export async function getBillingState() {
  const user = await requireUser();
  return getBillingStateForUser(user.sub);
}

export async function getAlertSettings() {
  const user = await requireUser();
  const settings = await prisma.vendorAlertSetting.findUnique({ where: { userId: user.sub } });

  if (!settings) {
    return {
      alertDays: DEFAULT_ALERT_DAYS,
      weeklySummary: true,
    };
  }

  return {
    ...settings,
    alertDays: normalizeAlertDays(settings.alertDays),
  };
}

export async function saveAlertSettings(alertDays: number[], weeklySummary: boolean) {
  const user = await requireUser();
  const normalizedAlertDays = normalizeAlertDays(alertDays);

  await prisma.vendorAlertSetting.upsert({
    where: { userId: user.sub },
    update: { alertDays: normalizedAlertDays, weeklySummary },
    create: { userId: user.sub, alertDays: normalizedAlertDays, weeklySummary },
  });

  revalidatePath("/dashboard");
}
