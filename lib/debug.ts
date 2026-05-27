import { env } from "./env";

export interface FooterMeta {
  cron: "daily" | "post-match" | "manual";
  fetchedAt: string;
  model: string;
  commitSha: string;
  vercelEnv: string;
}

export function makeFooterMeta(cron: FooterMeta["cron"]): FooterMeta {
  return {
    cron,
    fetchedAt: new Date().toISOString(),
    model: env.model,
    commitSha: env.commitSha,
    vercelEnv: env.vercelEnv,
  };
}

export function footerText(m: FooterMeta): string {
  return `cron=${m.cron} · fetched=${m.fetchedAt} · model=${m.model} · sha=${m.commitSha} · env=${m.vercelEnv}`;
}
