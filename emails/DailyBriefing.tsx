import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { Match, StandingRow } from "@/lib/football";
import { formatKST, competitionLabel } from "@/lib/football";
import type { NewsItem } from "@/lib/rss";
import type { FooterMeta } from "@/lib/debug";
import { footerText } from "@/lib/debug";

export interface DailyProps {
  summary: string;
  fixtures: Match[];
  standings: StandingRow[];
  uclFixtures: Match[];
  news: NewsItem[];
  meta: FooterMeta;
}

const cardStyle = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
};

const BARCA_ID = 81;
const RIVAL_NAMES = ["Real Madrid", "Real Madrid CF", "Atlético de Madrid", "Atletico Madrid", "Girona FC"];

export default function DailyBriefing(props: DailyProps) {
  const { summary, fixtures, standings, uclFixtures, news, meta } = props;

  const barcaIdx = standings.findIndex((s) => s.team.id === BARCA_ID);
  const top3 = standings.slice(0, 3);
  const rivals = standings.filter((s) => RIVAL_NAMES.some((n) => s.team.name.includes(n)));

  return (
    <Html>
      <Head />
      <Preview>오늘의 바르샤 브리핑</Preview>
      <Body style={{ background: "#fafafa", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
          <Heading style={{ fontSize: 22 }}>🔵🔴 오늘의 바르샤</Heading>

          <Section style={cardStyle}>
            <Text style={{ whiteSpace: "pre-wrap", margin: 0 }}>{summary}</Text>
          </Section>

          <Section style={cardStyle}>
            <Heading as="h2" style={{ fontSize: 16 }}>
              📅 향후 7일 경기
            </Heading>
            {fixtures.length === 0 ? (
              <Text style={{ color: "#888" }}>예정된 경기 없음</Text>
            ) : (
              fixtures.map((f) => (
                <Text key={f.id} style={{ margin: "4px 0" }}>
                  <strong>{formatKST(f.utcDate)}</strong> · {competitionLabel(f.competition.code)} ·{" "}
                  {f.homeTeam.id === BARCA_ID ? "vs " : "@ "}
                  {f.homeTeam.id === BARCA_ID ? f.awayTeam.name : f.homeTeam.name}
                </Text>
              ))
            )}
          </Section>

          <Section style={cardStyle}>
            <Heading as="h2" style={{ fontSize: 16 }}>
              🏆 라리가 순위
            </Heading>
            {barcaIdx >= 0 && (
              <Text style={{ margin: "4px 0" }}>
                바르샤: <strong>{standings[barcaIdx].position}위</strong> ·{" "}
                {standings[barcaIdx].points}점 ({standings[barcaIdx].won}승{" "}
                {standings[barcaIdx].draw}무 {standings[barcaIdx].lost}패)
              </Text>
            )}
            <Hr style={{ margin: "8px 0" }} />
            {top3.map((s) => (
              <Text key={s.team.id} style={{ margin: "2px 0" }}>
                {s.position}. {s.team.name} — {s.points}점
              </Text>
            ))}
            {rivals.length > 0 && <Hr style={{ margin: "8px 0" }} />}
            {rivals.map((s) => {
              const diff =
                barcaIdx >= 0 ? standings[barcaIdx].points - s.points : 0;
              return (
                <Text key={s.team.id} style={{ margin: "2px 0", color: "#555" }}>
                  {s.team.name} — {s.points}점 ({diff > 0 ? `+${diff}` : diff})
                </Text>
              );
            })}
          </Section>

          {uclFixtures.length > 0 && (
            <Section style={cardStyle}>
              <Heading as="h2" style={{ fontSize: 16 }}>
                ⭐ 챔스
              </Heading>
              {uclFixtures.map((f) => (
                <Text key={f.id} style={{ margin: "4px 0" }}>
                  {f.stage} · {formatKST(f.utcDate)} ·{" "}
                  {f.homeTeam.id === BARCA_ID ? f.awayTeam.name : f.homeTeam.name}
                </Text>
              ))}
            </Section>
          )}

          {news.length > 0 && (
            <Section style={cardStyle}>
              <Heading as="h2" style={{ fontSize: 16 }}>
                📰 헤드라인 / 뉴스
              </Heading>
              {news.map((n, idx) => (
                <Text key={idx} style={{ margin: "4px 0" }}>
                  <Link href={n.link}>{n.title}</Link>{" "}
                  <span style={{ color: "#888", fontSize: 12 }}>· {n.source}</span>
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
