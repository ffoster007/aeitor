import { NextResponse } from "next/server";

import { runHardDeleteSweep } from "@/lib/account-deletion";
import { isAuthorizedCronRequest } from "@/lib/cron";

export async function GET(req: Request) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = new URL(req.url).searchParams.get("mode") ?? "hard-delete";

  if (mode !== "hard-delete") {
    return NextResponse.json({ error: "Unsupported mode" }, { status: 400 });
  }

  const summary = await runHardDeleteSweep(100);
  return NextResponse.json({ ok: true, mode, summary });
}
