import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

function escapeCsvValue(value: string | number): string {
  const normalized = String(value).replace(/"/g, '""');
  return `"${normalized}"`;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function GET() {
  let user;

  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendors = await prisma.vendor.findMany({
    where: { userId: user.sub },
    orderBy: { endDate: "asc" },
  });

  const header = ["name", "end date", "notice period", "monthly cost"];
  const rows = vendors.map((vendor) =>
    [
      vendor.name,
      formatDate(vendor.endDate),
      vendor.noticePeriod,
      vendor.monthlyCost.toFixed(2),
    ]
      .map(escapeCsvValue)
      .join(","),
  );

  const csv = [header.map(escapeCsvValue).join(","), ...rows].join("\n");
  const timestamp = new Date().toISOString().slice(0, 10);

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vendors-${timestamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}