import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron";
import { runVendorAlertJob, type VendorAlertMode } from "@/lib/vendor-alert-jobs";

function getMode(req: Request, fallback: VendorAlertMode = "alerts") {
  const requestedMode = new URL(req.url).searchParams.get("mode");

  if (requestedMode === "alerts" || requestedMode === "weekly" || requestedMode === "both") {
    return requestedMode;
  }

  return fallback;
}

async function handleAlertRequest(req: Request, fallbackMode: VendorAlertMode = "alerts") {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = getMode(req, fallbackMode);
  const results = await runVendorAlertJob(mode);

  return NextResponse.json({ ok: true, results });
}

export async function GET(req: Request) {
  return handleAlertRequest(req, "alerts");
}

export async function POST(req: Request) {
  return handleAlertRequest(req, "alerts");
}
