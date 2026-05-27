import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = "https://api.football-data.org/v4";

async function probe(label: string, path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Auth-Token": env.footballToken },
    cache: "no-store",
  });
  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* keep raw */
  }
  return {
    label,
    path,
    status: res.status,
    ok: res.ok,
    headers: {
      remaining: res.headers.get("X-Requests-Available-Minute"),
      reset: res.headers.get("X-RequestCounter-Reset"),
    },
    bodyPreview:
      typeof parsed === "string"
        ? parsed.slice(0, 200)
        : truncate(parsed, 500),
  };
}

function truncate(obj: unknown, maxLen: number): unknown {
  const s = JSON.stringify(obj);
  if (s.length <= maxLen) return obj;
  return s.slice(0, maxLen) + "…";
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const probes = [
    ["competition_pd", "/competitions/PD"],
    ["standings_current", "/competitions/PD/standings"],
    ["standings_2024", "/competitions/PD/standings?season=2024"],
    ["standings_2023", "/competitions/PD/standings?season=2023"],
    ["scorers_pd", "/competitions/PD/scorers"],
    ["matches_pd_current", "/competitions/PD/matches"],
    ["team_barca", "/teams/81"],
    ["team_barca_matches", "/teams/81/matches?status=SCHEDULED"],
    ["competition_cl", "/competitions/CL/standings"],
  ] as const;

  const results = [];
  for (const [label, path] of probes) {
    results.push(await probe(label, path));
  }

  return NextResponse.json({
    env: {
      footballToken: maskEnv(env.footballToken),
      geminiKey: maskEnv(env.geminiKey),
      resendKey: maskEnv(env.resendKey),
      recipient: env.recipient || "(missing)",
      upstashUrl: env.upstashUrl ? "set" : "(missing)",
    },
    results,
  });
}

function maskEnv(v: string): string {
  if (!v) return "(MISSING)";
  return `len=${v.length} prefix=${v.slice(0, 6)}`;
}
