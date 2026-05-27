import { render } from "@react-email/render";
import MatchRecap from "@/emails/MatchRecap";
import {
  getYesterdayFixtures,
  getLineups,
  getFixtureEvents,
  getFixtureStatistics,
  formatKST,
  type Fixture,
} from "./football";
import { summarize } from "./claude";
import { sendEmail } from "./mailer";
import { makeFooterMeta } from "./debug";
import { makeReportId, saveReport } from "./kv";

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

export async function runPostMatch(): Promise<
  | { ok: true; sent: number; emailIds: string[] }
  | { ok: true; sent: 0; reason: string }
> {
  const yesterday = await getYesterdayFixtures();
  const finished = yesterday.filter((f) =>
    FINISHED_STATUSES.has(f.fixture.status.short),
  );

  if (finished.length === 0) {
    return { ok: true, sent: 0, reason: "no fixture yesterday" };
  }

  const emailIds: string[] = [];
  for (const fixture of finished) {
    emailIds.push(await sendOne(fixture));
  }
  return { ok: true, sent: emailIds.length, emailIds };
}

async function sendOne(fixture: Fixture): Promise<string> {
  const [lineups, events, statistics] = await Promise.all([
    getLineups(fixture.fixture.id),
    getFixtureEvents(fixture.fixture.id),
    getFixtureStatistics(fixture.fixture.id),
  ]);

  const summaryInput = buildSummaryInput({ fixture, events, statistics });
  const summary = await summarize({ data: summaryInput, kind: "match" });
  const meta = makeFooterMeta("post-match");

  const html = await render(
    MatchRecap({ summary, fixture, lineups, events, statistics, meta }),
  );

  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const subject = `📝 ${home.name} ${fixture.goals.home ?? "-"}:${fixture.goals.away ?? "-"} ${away.name} — ${fixture.league.name}`;
  const emailId = await sendEmail({ subject, html });

  const date = fixture.fixture.date.slice(0, 10);
  await saveReport({
    id: makeReportId("post-match", `${date}-${fixture.fixture.id}`),
    type: "post-match",
    date,
    raw: { fixture, lineups, events, statistics },
    summary,
    createdAt: meta.fetchedAt,
  });
  return emailId;
}

function buildSummaryInput(args: {
  fixture: Fixture;
  events: Awaited<ReturnType<typeof getFixtureEvents>>;
  statistics: Awaited<ReturnType<typeof getFixtureStatistics>>;
}): string {
  const { fixture, events, statistics } = args;
  const score = `${fixture.goals.home ?? "-"} : ${fixture.goals.away ?? "-"}`;
  const head = `${fixture.league.name} · ${formatKST(fixture.fixture.date)} · ${fixture.teams.home.name} ${score} ${fixture.teams.away.name}`;

  const goals = events
    .filter((e) => e.type === "Goal")
    .map(
      (g) =>
        `${g.time.elapsed}' ${g.team.name} · ${g.player.name}${g.assist.name ? ` (assist ${g.assist.name})` : ""}`,
    )
    .join("\n");

  const cards = events
    .filter((e) => e.type === "Card")
    .map((c) => `${c.time.elapsed}' ${c.player.name} ${c.detail}`)
    .join("\n");

  const statsText = statistics
    .map((t) => {
      const picked = t.statistics
        .filter((s) =>
          ["Ball Possession", "Total Shots", "Shots on Goal", "expected_goals"].includes(
            s.type,
          ),
        )
        .map((s) => `${s.type}=${s.value ?? "-"}`)
        .join(", ");
      return `${t.team.name}: ${picked}`;
    })
    .join("\n");

  return [
    `[경기]\n${head}`,
    `[득점]\n${goals || "(없음)"}`,
    `[카드]\n${cards || "(없음)"}`,
    `[통계]\n${statsText || "(없음)"}`,
  ].join("\n\n");
}
