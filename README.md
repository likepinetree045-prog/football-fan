# Barca Daily

FC Barcelona 데일리 인포 봇 — 매일 KST 08:00 데일리 브리핑, 경기 다음날 KST 10:00 리뷰를 본인 이메일로 발송.

## Stack
- Next.js 15 (App Router) on Vercel Hobby
- Vercel Cron + Upstash Redis (저장)
- football-data.org (라리가/챔스 일정·순위·결과·득점)
- Claude `claude-haiku-4-5` (요약, 프롬프트 캐싱)
- Resend (메일)

**무료 티어 제약**: football-data.org 무료 플랜은 코파 델 레이(CDR) 미제공. 라인업·통계·부상자도 없음.

## Setup

1. `.env.example` 복사 → `.env.local` 채우기
2. `pnpm install` (또는 `npm install`)
3. `pnpm dev` → http://localhost:3000

수동 테스트:
```
curl "http://localhost:3000/api/trigger?type=daily&secret=<CRON_SECRET>"
curl "http://localhost:3000/api/trigger?type=post-match&secret=<CRON_SECRET>"
```

## Deploy

1. Vercel에서 GitHub 리포 Import
2. Env vars 세팅 (`.env.example` 참고)
3. Storage 탭에서 Upstash Redis 연결 (자동 주입)
4. Production Branch를 머지 대상 브랜치로 설정

Cron은 `vercel.json`에 정의:
- `0 23 * * *` UTC = KST 08:00 → `/api/daily`
- `0 1 * * *` UTC = KST 10:00 → `/api/post-match`

## Architecture

```
app/api/daily         → runDaily()      → API-Football + RSS → Claude → Resend → KV
app/api/post-match    → runPostMatch()  → 어제 경기 있으면 위와 동일, 없으면 조용히 종료
app/api/trigger       → 위 두 개 수동 호출
```

세부 설계는 `/root/.claude/plans/nested-hugging-koala.md` 참고.
