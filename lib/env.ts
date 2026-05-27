export const env = {
  footballToken: process.env.FOOTBALLDATA_TOKEN ?? "",
  geminiKey: process.env.GEMINI_API_KEY ?? "",
  resendKey: process.env.RESEND_API_KEY ?? "",
  resendFrom: process.env.RESEND_FROM ?? "Barca Daily <onboarding@resend.dev>",
  recipient: process.env.RECIPIENT_EMAIL ?? "",
  cronSecret: process.env.CRON_SECRET ?? "",
  upstashUrl: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "",
  upstashToken:
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "",
  // football-data.org IDs
  teamId: Number(process.env.BARCA_TEAM_ID ?? 81), // FC Barcelona on football-data.org
  laLigaCode: process.env.LALIGA_CODE ?? "PD", // Primera Division
  uclCode: process.env.UCL_CODE ?? "CL",
  commitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
  vercelEnv: process.env.VERCEL_ENV ?? "development",
  model: "gemini-2.0-flash",
};
