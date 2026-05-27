export const env = {
  apiFootballKey: process.env.APIFOOTBALL_KEY ?? "",
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? "",
  resendKey: process.env.RESEND_API_KEY ?? "",
  resendFrom: process.env.RESEND_FROM ?? "Barca Daily <onboarding@resend.dev>",
  recipient: process.env.RECIPIENT_EMAIL ?? "",
  cronSecret: process.env.CRON_SECRET ?? "",
  upstashUrl: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "",
  upstashToken:
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "",
  teamId: Number(process.env.BARCA_TEAM_ID ?? 529),
  laLigaId: Number(process.env.LALIGA_LEAGUE_ID ?? 140),
  uclId: Number(process.env.UCL_LEAGUE_ID ?? 2),
  copaId: Number(process.env.COPA_LEAGUE_ID ?? 143),
  commitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
  vercelEnv: process.env.VERCEL_ENV ?? "development",
  model: "claude-haiku-4-5",
};

export function currentSeason(now = new Date()): number {
  // La Liga / Champions / Copa run Aug → May. API-Football's `season` is the start year.
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  return month >= 7 ? year : year - 1;
}
