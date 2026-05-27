import { render } from "@react-email/render";
import DailyBriefing from "@/emails/DailyBriefing";
import { env } from "./env";
import {
  getUpcomingFixtures,
  getLaLigaStandings,
  formatKST,
  competitionLabel,
  type Match,
  type StandingRow,
} from "./football";
import { getNews } from "./rss";
import { summarize } from "./claude";
import { sendEmail } from "./mailer";
import { makeFooterMeta } from "./debug";
import { makeReportId, saveReport } from "./kv";

export async function runDaily(): Promise<{ ok: true; emailId: string }> {
  const [fixtures, standings, news] = await Promise.all([
    getUpcomingFixtures(7),
    getLaLigaStandings(),
    getNews(8),
  ]);

  const uclFixtures = fixtures.filter((f) => f.competition.code === env.uclCode);

  const summaryInput = buildSummaryInput({ fixtures, standings, news });
  const summary = await summarize({ data: summaryInput, kind: "daily" });
  const meta = makeFooterMeta("daily");

  const html = await render(
    DailyBriefing({
      summary,
      fixtures,
      standings,
      uclFixtures,
      news,
      meta,
    }),
  );

  const today = new Date().toISOString().slice(0, 10);
  const subject = `🔵🔴 바르샤 데일리 — ${today}`;
  const emailId = await sendEmail({ subject, html });

  await saveReport({
    id: makeReportId("daily", today),
    type: "daily",
    date: today,
    raw: { fixtures, standings, news },
    summary,
    createdAt: meta.fetchedAt,
  });

  return { ok: true, emailId };
}

function buildSummaryInput(args: {
  fixtures: Match[];
  standings: StandingRow[];
  news: Awaited<ReturnType<typeof getNews>>;
}): string {
  const { fixtures, standings, news } = args;
  const fixturesText = fixtures.length
    ? fixtures
        .map(
          (f) =>
            `- ${formatKST(f.utcDate)} · ${competitionLabel(f.competition.code)} · ${f.homeTeam.name} vs ${f.awayTeam.name}`,
        )
        .join("\n")
    : "(예정 경기 없음)";

  const barca = standings.find((s) => s.team.id === env.teamId);
  const real = standings.find((s) => /Real Madrid/i.test(s.team.name));
  const atletico = standings.find(
    (s) => /Atl[eé]tico/i.test(s.team.name) && /Madrid/i.test(s.team.name),
  );
  const standingsText = barca
    ? `바르샤 ${barca.position}위 ${barca.points}점 (${barca.won}승 ${barca.draw}무 ${barca.lost}패). ` +
      (real ? `레알 ${real.position}위 ${real.points}점. ` : "") +
      (atletico ? `아틀레티코 ${atletico.position}위 ${atletico.points}점.` : "")
    : "(순위 정보 없음)";

  const newsText = news.length
    ? news
        .slice(0, 5)
        .map((n) => `- ${n.title}`)
        .join("\n")
    : "(뉴스 없음)";

  return [
    `[향후 7일 경기]\n${fixturesText}`,
    `[라리가 순위]\n${standingsText}`,
    `[헤드라인]\n${newsText}`,
  ].join("\n\n");
}
