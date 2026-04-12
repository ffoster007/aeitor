import { NextResponse } from "next/server";

import { runHardDeleteSweep } from "@/lib/account-deletion";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = new URL(req.url).searchParams.get("mode") ?? "hard-delete";

  if (mode !== "hard-delete") {
    return NextResponse.json({ error: "Unsupported mode" }, { status: 400 });
  }

  const summary = await runHardDeleteSweep(100);
  return NextResponse.json({ ok: true, mode, summary });
}
