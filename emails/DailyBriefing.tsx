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
import type { Fixture, Injury, StandingRow } from "@/lib/football";
import { formatKST } from "@/lib/football";
import type { NewsItem } from "@/lib/rss";
import type { FooterMeta } from "@/lib/debug";
import { footerText } from "@/lib/debug";

export interface DailyProps {
  summary: string;
  fixtures: Fixture[];
  standings: StandingRow[];
  uclFixtures: Fixture[];
  copaFixtures: Fixture[];
  injuries: Injury[];
  news: NewsItem[];
  meta: FooterMeta;
}

const cardStyle = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
};

export default function DailyBriefing(props: DailyProps) {
  const { summary, fixtures, standings, uclFixtures, copaFixtures, injuries, news, meta } =
    props;

  const barcaIdx = standings.findIndex((s) => s.team.id === 529);
  const top3 = standings.slice(0, 3);
  const rivals = standings.filter((s) =>
    ["Real Madrid", "Atletico Madrid", "Girona"].includes(s.team.name),
  );

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
                <Text key={f.fixture.id} style={{ margin: "4px 0" }}>
                  <strong>{formatKST(f.fixture.date)}</strong> · {f.league.name} ·{" "}
                  {f.teams.home.id === 529 ? "vs " : "@ "}
                  {f.teams.home.id === 529 ? f.teams.away.name : f.teams.home.name}
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
                바르샤: <strong>{standings[barcaIdx].rank}위</strong> ·{" "}
                {standings[barcaIdx].points}점 (
                {standings[barcaIdx].all.win}승 {standings[barcaIdx].all.draw}무{" "}
                {standings[barcaIdx].all.lose}패)
              </Text>
            )}
            <Hr style={{ margin: "8px 0" }} />
            {top3.map((s) => (
              <Text key={s.team.id} style={{ margin: "2px 0" }}>
                {s.rank}. {s.team.name} — {s.points}점
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
                <Text key={f.fixture.id} style={{ margin: "4px 0" }}>
                  {f.league.round} · {formatKST(f.fixture.date)} ·{" "}
                  {f.teams.home.id === 529 ? f.teams.away.name : f.teams.home.name}
                </Text>
              ))}
            </Section>
          )}

          {copaFixtures.length > 0 && (
            <Section style={cardStyle}>
              <Heading as="h2" style={{ fontSize: 16 }}>
                🏅 코파 델 레이
              </Heading>
              {copaFixtures.map((f) => (
                <Text key={f.fixture.id} style={{ margin: "4px 0" }}>
                  {f.league.round} · {formatKST(f.fixture.date)} ·{" "}
                  {f.teams.home.id === 529 ? f.teams.away.name : f.teams.home.name}
                </Text>
              ))}
            </Section>
          )}

          {injuries.length > 0 && (
            <Section style={cardStyle}>
              <Heading as="h2" style={{ fontSize: 16 }}>
                🏥 부상자 / 출장 정지
              </Heading>
              {injuries.slice(0, 10).map((i, idx) => (
                <Text key={`${i.player.id}-${idx}`} style={{ margin: "2px 0" }}>
                  {i.player.name} — {i.type} ({i.reason})
                </Text>
              ))}
            </Section>
          )}

          {news.length > 0 && (
            <Section style={cardStyle}>
              <Heading as="h2" style={{ fontSize: 16 }}>
                📰 선수 소식 / 헤드라인
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
