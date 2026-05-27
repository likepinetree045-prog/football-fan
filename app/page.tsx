import { getRecentReports } from "@/lib/kv";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const reports = await getRecentReports(14).catch(() => []);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>🔵🔴 Barca Daily</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        최근 14일 리포트 — 매일 KST 08:00 데일리, 경기 다음날 KST 10:00 리뷰
      </p>

      {reports.length === 0 ? (
        <p style={{ color: "#888" }}>
          아직 저장된 리포트가 없습니다. <code>/api/trigger?type=daily&secret=…</code> 로
          한 번 실행해 보세요.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {reports.map((r) => (
            <li
              key={r.id}
              style={{
                border: "1px solid #222",
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 12, color: "#888" }}>
                {r.type} · {r.date}
              </div>
              <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                {r.summary ?? "(요약 없음)"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
