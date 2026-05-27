import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { runPostMatch } from "@/lib/postMatch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await runPostMatch();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/post-match]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
