import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { runDaily } from "@/lib/daily";
import { runPostMatch } from "@/lib/postMatch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  try {
    if (type === "daily") {
      return NextResponse.json(await runDaily());
    }
    if (type === "post-match") {
      return NextResponse.json(await runPostMatch());
    }
    return NextResponse.json(
      { error: "missing or invalid ?type=daily|post-match" },
      { status: 400 },
    );
  } catch (err) {
    console.error("[/api/trigger]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
