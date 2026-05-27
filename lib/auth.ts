import { env } from "./env";

// Vercel cron requests include `Authorization: Bearer <CRON_SECRET>`.
// Manual triggers can pass `?secret=` instead.
export function isAuthorized(req: Request): boolean {
  if (!env.cronSecret) return false;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${env.cronSecret}`) return true;
  const url = new URL(req.url);
  return url.searchParams.get("secret") === env.cronSecret;
}
