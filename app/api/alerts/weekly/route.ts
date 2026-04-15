import { NextResponse } from "next/server";

import { isAuthorizedCronRequest } from "@/lib/cron";
import { runVendorAlertJob } from "@/lib/vendor-alert-jobs";

export async function GET(req: Request) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runVendorAlertJob("weekly");
  return NextResponse.json({ ok: true, results });
}