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
import type { Match } from "@/lib/football";
import { formatKST, competitionLabel } from "@/lib/football";
import type { FooterMeta } from "@/lib/debug";
import { footerText } from "@/lib/debug";

export interface MatchRecapProps {
  summary: string;
  match: Match;
  meta: FooterMeta;
}

const cardStyle = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
};

export default function MatchRecap(props: MatchRecapProps) {
  const { summary, match, meta } = props;
  const goals = match.goals ?? [];
  const cards = match.bookings ?? [];

  const home = match.homeTeam;
  const away = match.awayTeam;
  const score = `${match.score.fullTime.home ?? "-"} : ${match.score.fullTime.away ?? "-"}`;

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
            {competitionLabel(match.competition.code)} · {formatKST(match.utcDate)}
          </Text>

          <Section style={{ ...cardStyle, textAlign: "center" }}>
            <Heading as="h2" style={{ fontSize: 24, margin: "8px 0" }}>
              {home.name} <span style={{ color: "#0070f3" }}>{score}</span> {away.name}
            </Heading>
            {match.venue && (
              <Text style={{ color: "#888", margin: 0 }}>{match.venue}</Text>
            )}
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
                  {g.minute}′ · {g.team.name} · <strong>{g.scorer.name}</strong>
                  {g.assist && (
                    <span style={{ color: "#888" }}> (어시: {g.assist.name})</span>
                  )}
                  {g.type !== "REGULAR" && (
                    <span style={{ color: "#888" }}> · {g.type}</span>
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
                  {c.minute}′ · {c.player.name} ({c.team.name}) · {c.card}
                </Text>
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
