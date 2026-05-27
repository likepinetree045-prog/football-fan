import { render } from "@react-email/render";
import MatchRecap from "@/emails/MatchRecap";
import {
  getYesterdayFinishedMatches,
  getMatchDetail,
  competitionLabel,
  formatKST,
  type Match,
} from "./football";
import { summarize } from "./claude";
import { sendEmail } from "./mailer";
import { makeFooterMeta } from "./debug";
import { makeReportId, saveReport } from "./kv";

export async function runPostMatch(): Promise<
  | { ok: true; sent: number; emailIds: string[] }
  | { ok: true; sent: 0; reason: string }
> {
  const finished = await getYesterdayFinishedMatches();
  if (finished.length === 0) {
    return { ok: true, sent: 0, reason: "no fixture yesterday" };
  }

  const emailIds: string[] = [];
  for (const fx of finished) {
    // Fetch goals/bookings detail.
    const detailed = await getMatchDetail(fx.id).catch(() => fx);
    emailIds.push(await sendOne(detailed));
  }
  return { ok: true, sent: emailIds.length, emailIds };
}

async function sendOne(match: Match): Promise<string> {
  const summaryInput = buildSummaryInput(match);
  const summary = await summarize({ data: summaryInput, kind: "match" });
  const meta = makeFooterMeta("post-match");

  const html = await render(MatchRecap({ summary, match, meta }));

  const score = `${match.score.fullTime.home ?? "-"}:${match.score.fullTime.away ?? "-"}`;
  const subject = `📝 ${match.homeTeam.name} ${score} ${match.awayTeam.name} — ${competitionLabel(match.competition.code)}`;
  const emailId = await sendEmail({ subject, html });

  const date = match.utcDate.slice(0, 10);
  await saveReport({
    id: makeReportId("post-match", `${date}-${match.id}`),
    type: "post-match",
    date,
    raw: match,
    summary,
    createdAt: meta.fetchedAt,
  });
  return emailId;
}

function buildSummaryInput(match: Match): string {
  const score = `${match.score.fullTime.home ?? "-"} : ${match.score.fullTime.away ?? "-"}`;
  const head = `${competitionLabel(match.competition.code)} · ${formatKST(match.utcDate)} · ${match.homeTeam.name} ${score} ${match.awayTeam.name}`;

  const goalsText = (match.goals ?? [])
    .map(
      (g) =>
        `${g.minute}' ${g.team.name} · ${g.scorer.name}${g.assist ? ` (assist ${g.assist.name})` : ""}${g.type !== "REGULAR" ? ` · ${g.type}` : ""}`,
    )
    .join("\n");

  const cardsText = (match.bookings ?? [])
    .map((b) => `${b.minute}' ${b.player.name} ${b.card}`)
    .join("\n");

  return [
    `[경기]\n${head}`,
    `[득점]\n${goalsText || "(없음)"}`,
    `[카드]\n${cardsText || "(없음)"}`,
  ].join("\n\n");
}
