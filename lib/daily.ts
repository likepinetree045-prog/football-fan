import { render } from "@react-email/render";
import DailyBriefing from "@/emails/DailyBriefing";
import { env } from "./env";
import {
  getFixturesNext,
  getLaLigaStandings,
  getInjuries,
  formatKST,
} from "./football";
import { getNews } from "./rss";
import { summarize } from "./claude";
import { sendEmail } from "./mailer";
import { makeFooterMeta } from "./debug";
import { makeReportId, saveReport } from "./kv";

export async function runDaily(): Promise<{ ok: true; emailId: string }> {
  const [fixtures, standings, injuries, news] = await Promise.all([
    getFixturesNext(7),
    getLaLigaStandings(),
    getInjuries(),
    getNews(8),
  ]);

  const uclFixtures = fixtures.filter((f) => f.league.id === env.uclId);
  const copaFixtures = fixtures.filter((f) => f.league.id === env.copaId);

  const summaryInput = buildSummaryInput({
    fixtures,
    standings,
    injuries,
    news,
  });

  const summary = await summarize({ data: summaryInput, kind: "daily" });
  const meta = makeFooterMeta("daily");

  const html = await render(
    DailyBriefing({
      summary,
      fixtures,
      standings,
      uclFixtures,
      copaFixtures,
      injuries,
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
    raw: { fixtures, standings, injuries, news },
    summary,
    createdAt: meta.fetchedAt,
  });

  return { ok: true, emailId };
}

function buildSummaryInput(args: {
  fixtures: Awaited<ReturnType<typeof getFixturesNext>>;
  standings: Awaited<ReturnType<typeof getLaLigaStandings>>;
  injuries: Awaited<ReturnType<typeof getInjuries>>;
  news: Awaited<ReturnType<typeof getNews>>;
}): string {
  const { fixtures, standings, injuries, news } = args;
  const fixturesText = fixtures.length
    ? fixtures
        .map(
          (f) =>
            `- ${formatKST(f.fixture.date)} · ${f.league.name} · ${f.teams.home.name} vs ${f.teams.away.name}`,
        )
        .join("\n")
    : "(예정 경기 없음)";

  const barca = standings.find((s) => s.team.id === env.teamId);
  const real = standings.find((s) => s.team.name === "Real Madrid");
  const atletico = standings.find((s) => s.team.name === "Atletico Madrid");
  const standingsText = barca
    ? `바르샤 ${barca.rank}위 ${barca.points}점 (${barca.all.win}승 ${barca.all.draw}무 ${barca.all.lose}패). ` +
      (real ? `레알 ${real.rank}위 ${real.points}점. ` : "") +
      (atletico ? `아틀레티코 ${atletico.rank}위 ${atletico.points}점.` : "")
    : "(순위 정보 없음)";

  const injuriesText = injuries.length
    ? injuries
        .slice(0, 8)
        .map((i) => `- ${i.player.name}: ${i.type} (${i.reason})`)
        .join("\n")
    : "(부상자 없음)";

  const newsText = news.length
    ? news
        .slice(0, 5)
        .map((n) => `- ${n.title}`)
        .join("\n")
    : "(뉴스 없음)";

  return [
    `[향후 7일 경기]\n${fixturesText}`,
    `[라리가 순위]\n${standingsText}`,
    `[부상자]\n${injuriesText}`,
    `[헤드라인]\n${newsText}`,
  ].join("\n\n");
}
