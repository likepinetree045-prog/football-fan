import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type {
  Fixture,
  FixtureEvent,
  Lineup,
  TeamStatistics,
} from "@/lib/football";
import { formatKST } from "@/lib/football";
import type { FooterMeta } from "@/lib/debug";
import { footerText } from "@/lib/debug";

export interface MatchRecapProps {
  summary: string;
  fixture: Fixture;
  lineups: Lineup[];
  events: FixtureEvent[];
  statistics: TeamStatistics[];
  meta: FooterMeta;
}

const cardStyle = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
};

const KEY_STATS = new Set([
  "Ball Possession",
  "Total Shots",
  "Shots on Goal",
  "expected_goals",
  "Corner Kicks",
  "Fouls",
  "Passes %",
]);

export default function MatchRecap(props: MatchRecapProps) {
  const { summary, fixture, lineups, events, statistics, meta } = props;
  const goals = events.filter((e) => e.type === "Goal");
  const cards = events.filter((e) => e.type === "Card");
  const barcaLineup = lineups.find((l) => l.team.id === 529);

  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const score = `${fixture.goals.home ?? "-"} : ${fixture.goals.away ?? "-"}`;

  return (
    <Html>
      <Head />
      <Preview>
        {home.name} {score} {away.name}
      </Preview>
      <Body style={{ background: "#fafafa", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
          <Heading style={{ fontSize: 22 }}>📝 경기 리뷰</Heading>
          <Text style={{ fontSize: 14, color: "#555" }}>
            {fixture.league.name} · {formatKST(fixture.fixture.date)}
          </Text>

          <Section style={{ ...cardStyle, textAlign: "center" }}>
            <Heading as="h2" style={{ fontSize: 24, margin: "8px 0" }}>
              {home.name} <span style={{ color: "#0070f3" }}>{score}</span>{" "}
              {away.name}
            </Heading>
            <Text style={{ color: "#888", margin: 0 }}>
              {fixture.fixture.venue.name ?? ""}
            </Text>
          </Section>

          <Section style={cardStyle}>
            <Text style={{ whiteSpace: "pre-wrap", margin: 0 }}>{summary}</Text>
          </Section>

          {goals.length > 0 && (
            <Section style={cardStyle}>
              <Heading as="h2" style={{ fontSize: 16 }}>
                ⚽ 득점
              </Heading>
              {goals.map((g, i) => (
                <Text key={i} style={{ margin: "2px 0" }}>
                  {g.time.elapsed}′ · {g.team.name} · <strong>{g.player.name}</strong>
                  {g.assist.name && (
                    <span style={{ color: "#888" }}> (어시: {g.assist.name})</span>
                  )}
                  {g.detail !== "Normal Goal" && (
                    <span style={{ color: "#888" }}> · {g.detail}</span>
                  )}
                </Text>
              ))}
            </Section>
          )}

          {cards.length > 0 && (
            <Section style={cardStyle}>
              <Heading as="h2" style={{ fontSize: 16 }}>
                🟨🟥 카드
              </Heading>
              {cards.map((c, i) => (
                <Text key={i} style={{ margin: "2px 0" }}>
                  {c.time.elapsed}′ · {c.player.name} ({c.team.name}) · {c.detail}
                </Text>
              ))}
            </Section>
          )}

          {barcaLineup && (
            <Section style={cardStyle}>
              <Heading as="h2" style={{ fontSize: 16 }}>
                🧢 바르샤 선발 ({barcaLineup.formation})
              </Heading>
              <Text style={{ margin: "2px 0" }}>
                감독: {barcaLineup.coach.name}
              </Text>
              <Text style={{ margin: "4px 0" }}>
                {barcaLineup.startXI
                  .map((p) => `${p.player.number}. ${p.player.name}`)
                  .join(" · ")}
              </Text>
            </Section>
          )}

          {statistics.length > 0 && (
            <Section style={cardStyle}>
              <Heading as="h2" style={{ fontSize: 16 }}>
                📊 팀 통계
              </Heading>
              {statistics.map((t) => (
                <div key={t.team.id} style={{ marginBottom: 8 }}>
                  <Text style={{ fontWeight: 600, margin: "4px 0" }}>{t.team.name}</Text>
                  {t.statistics
                    .filter((s) => KEY_STATS.has(s.type))
                    .map((s) => (
                      <Text key={s.type} style={{ margin: "2px 0", color: "#555" }}>
                        {s.type}: {s.value ?? "-"}
                      </Text>
                    ))}
                </div>
              ))}
            </Section>
          )}

          <Hr />
          <Text style={{ color: "#888", fontSize: 11 }}>{footerText(meta)}</Text>
        </Container>
      </Body>
    </Html>
  );
}
