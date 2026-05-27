import { Redis } from "@upstash/redis";
import { env } from "./env";

let _redis: Redis | null = null;

function redis(): Redis | null {
  if (!env.upstashUrl || !env.upstashToken) return null;
  if (!_redis) {
    _redis = new Redis({ url: env.upstashUrl, token: env.upstashToken });
  }
  return _redis;
}

const TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

export type ReportType = "daily" | "post-match";

export interface StoredReport {
  id: string;
  type: ReportType;
  date: string; // YYYY-MM-DD
  raw: unknown;
  summary: string;
  createdAt: string;
}

const INDEX_KEY = "report:index";

export function makeReportId(type: ReportType, date: string): string {
  return `${type}:${date}`;
}

function reportKey(id: string): string {
  return `report:${id}`;
}

export async function saveReport(report: StoredReport): Promise<void> {
  const r = redis();
  if (!r) return;
  await r.set(reportKey(report.id), JSON.stringify(report), { ex: TTL_SECONDS });
  await r.zadd(INDEX_KEY, { score: Date.now(), member: report.id });
  await r.zremrangebyrank(INDEX_KEY, 0, -51);
}

export async function getRecentReports(_days = 14): Promise<StoredReport[]> {
  const r = redis();
  if (!r) return [];
  const ids = (await r.zrange<string[]>(INDEX_KEY, 0, -1, { rev: true })) ?? [];
  if (!ids.length) return [];
  const values = await r.mget<(string | null)[]>(...ids.map(reportKey));
  return values
    .map((v) => {
      if (!v) return null;
      try {
        return JSON.parse(v) as StoredReport;
      } catch {
        return null;
      }
    })
    .filter((v): v is StoredReport => v !== null);
}
