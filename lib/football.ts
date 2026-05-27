import { env, currentSeason } from "./env";

const BASE = "https://v3.football.api-sports.io";

async function call<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const url = `${BASE}${path}?${qs}`;
  const res = await fetch(url, {
    headers: { "x-apisports-key": env.apiFootballKey },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API-Football ${path} ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { response: T; errors?: unknown };
  if (json.errors && Object.keys(json.errors as object).length > 0) {
    throw new Error(`API-Football ${path} errors: ${JSON.stringify(json.errors)}`);
  }
  return json.response;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string; elapsed: number | null };
    venue: { name: string | null; city: string | null };
  };
  league: { id: number; name: string; round: string };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

export interface StandingRow {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  all: { played: number; win: number; draw: number; lose: number };
  form: string | null;
}

export interface Injury {
  player: { id: number; name: string; photo: string };
  team: { name: string };
  fixture: { date: string };
  type: string;
  reason: string;
}

export interface LineupPlayer {
  player: { id: number; name: string; number: number; pos: string; grid: string | null };
}

export interface Lineup {
  team: { id: number; name: string; logo: string };
  formation: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
  coach: { id: number; name: string; photo: string };
}

export interface FixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

export interface TeamStatistics {
  team: { id: number; name: string };
  statistics: Array<{ type: string; value: number | string | null }>;
}

export async function getFixturesNext(days = 7): Promise<Fixture[]> {
  const from = new Date();
  const to = new Date();
  to.setUTCDate(to.getUTCDate() + days);
  return call<Fixture[]>("/fixtures", {
    team: env.teamId,
    season: currentSeason(),
    from: isoDate(from),
    to: isoDate(to),
  });
}

export async function getYesterdayFixtures(): Promise<Fixture[]> {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return call<Fixture[]>("/fixtures", {
    team: env.teamId,
    season: currentSeason(),
    date: isoDate(yesterday),
  });
}

export async function getLaLigaStandings(): Promise<StandingRow[]> {
  const data = await call<
    Array<{ league: { standings: StandingRow[][] } }>
  >("/standings", { league: env.laLigaId, season: currentSeason() });
  return data[0]?.league.standings[0] ?? [];
}

export async function getInjuries(): Promise<Injury[]> {
  return call<Injury[]>("/injuries", {
    team: env.teamId,
    season: currentSeason(),
  });
}

export async function getLineups(fixtureId: number): Promise<Lineup[]> {
  return call<Lineup[]>("/fixtures/lineups", { fixture: fixtureId });
}

export async function getFixtureEvents(fixtureId: number): Promise<FixtureEvent[]> {
  return call<FixtureEvent[]>("/fixtures/events", { fixture: fixtureId });
}

export async function getFixtureStatistics(fixtureId: number): Promise<TeamStatistics[]> {
  return call<TeamStatistics[]>("/fixtures/statistics", { fixture: fixtureId });
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
