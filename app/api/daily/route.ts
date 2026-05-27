import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { runDaily } from "@/lib/daily";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await runDaily();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/daily]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
