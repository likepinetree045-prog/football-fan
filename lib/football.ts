import { env } from "./env";

const BASE = "https://api.football-data.org/v4";

async function call<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { "X-Auth-Token": env.footballToken },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `football-data ${path} ${res.status}: ${await res.text()}`,
    );
  }
  // Honor server-side throttling: free tier is 10 req/min. If remaining hits 0,
  // wait until the counter resets so the next call doesn't 429.
  const remaining = Number(res.headers.get("X-Requests-Available-Minute") ?? -1);
  const resetIn = Number(res.headers.get("X-RequestCounter-Reset") ?? 0);
  if (remaining === 0 && resetIn > 0 && resetIn < 65) {
    await new Promise((r) => setTimeout(r, (resetIn + 1) * 1000));
  }
  return (await res.json()) as T;
}

// ---- Types (subset of football-data.org v4) ----

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED";

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number | null;
  stage: string;
  group: string | null;
  competition: { id: number; code: string; name: string };
  homeTeam: { id: number; name: string; shortName: string | null; tla: string | null };
  awayTeam: { id: number; name: string; shortName: string | null; tla: string | null };
  score: {
    winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  goals?: Goal[];
  bookings?: Booking[];
  venue?: string | null;
}

export interface Goal {
  minute: number;
  injuryTime: number | null;
  type: "REGULAR" | "OWN" | "PENALTY" | "OVERTIME";
  team: { id: number; name: string };
  scorer: { id: number; name: string };
  assist: { id: number; name: string } | null;
  score: { home: number; away: number };
}

export interface Booking {
  minute: number;
  team: { id: number; name: string };
  player: { id: number; name: string };
  card: "YELLOW" | "RED" | "YELLOW_RED";
}

export interface StandingRow {
  position: number;
  team: { id: number; name: string; shortName: string | null; crest: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string | null;
}

// ---- Endpoints ----

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getTeamMatches(opts: {
  status?: MatchStatus | MatchStatus[];
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<Match[]> {
  const params: Record<string, string> = {};
  if (opts.status) {
    params.status = Array.isArray(opts.status) ? opts.status.join(",") : opts.status;
  }
  if (opts.dateFrom) params.dateFrom = isoDate(opts.dateFrom);
  if (opts.dateTo) params.dateTo = isoDate(opts.dateTo);
  const data = await call<{ matches: Match[] }>(
    `/teams/${env.teamId}/matches`,
    params,
  );
  return data.matches ?? [];
}

export async function getUpcomingFixtures(days = 7): Promise<Match[]> {
  const from = new Date();
  const to = new Date();
  to.setUTCDate(to.getUTCDate() + days);
  return getTeamMatches({ status: ["SCHEDULED", "TIMED"], dateFrom: from, dateTo: to });
}

export async function getYesterdayFinishedMatches(): Promise<Match[]> {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const today = new Date();
  return getTeamMatches({
    status: "FINISHED",
    dateFrom: yesterday,
    dateTo: today,
  });
}

export async function getLaLigaStandings(): Promise<StandingRow[]> {
  const data = await call<{
    standings: Array<{ type: string; table: StandingRow[] }>;
  }>(`/competitions/${env.laLigaCode}/standings`);
  const total = data.standings.find((s) => s.type === "TOTAL");
  return total?.table ?? [];
}

export async function getMatchDetail(matchId: number): Promise<Match> {
  // football-data v4 returns the match object directly (not wrapped) on /matches/{id}.
  return call<Match>(`/matches/${matchId}`);
}

export function isBarca(teamId: number): boolean {
  return teamId === env.teamId;
}

export function formatKST(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function competitionLabel(code: string): string {
  switch (code) {
    case "PD":
      return "라리가";
    case "CL":
      return "챔스";
    case "CDR":
      return "코파";
    case "SA":
      return "세리에 A";
    default:
      return code;
  }
}
