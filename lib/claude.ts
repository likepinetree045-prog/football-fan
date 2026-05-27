import { GoogleGenAI } from "@google/genai";
import { env } from "./env";

const ai = new GoogleGenAI({ apiKey: env.geminiKey });

const SYSTEM_RULES = `너는 FC 바르셀로나 팬을 위한 한국어 일일 브리핑 작성자다.

규칙:
- 항상 한국어 존댓말로 4–6문장.
- 톤은 차분하고 정보 위주. 과한 감정 표현·이모지 남발 금지(시작 1개만 허용).
- 사실에 없는 내용은 추측하지 않는다. 데이터에 없으면 "정보 없음"이라고 적는다.
- 경기 시간은 KST 기준으로 명시한다.
- 라 리가는 "라리가", 챔피언스리그는 "챔스", 코파 델 레이는 "코파"로 부른다.
- 라이벌(레알 마드리드, 아틀레티코)과의 승점 격차는 가능한 한 짚는다.

시즌 컨텍스트:
- 팀: FC 바르셀로나
- 주요 라이벌: 레알 마드리드, 아틀레티코 마드리드, 지로나
- 홈 구장: 캄프 누 (리모델링 기간엔 몬주이크 임시 사용)

출력 형식: 줄바꿈으로 구분된 평문 문장. 불릿/마크다운 금지.`;

interface SummaryOptions {
  data: string;
  kind: "daily" | "match";
}

export async function summarize({ data, kind }: SummaryOptions): Promise<string> {
  const taskInstruction =
    kind === "daily"
      ? "아래 오늘 데이터를 바탕으로 데일리 브리핑 헤더를 작성하라. 향후 일정·순위·뉴스를 4-5문장으로."
      : "아래 어제 경기 결과 데이터를 바탕으로 경기 리뷰를 작성하라. 스코어·득점자·흐름을 5-6문장으로.";

  const response = await ai.models.generateContent({
    model: env.model,
    contents: [
      {
        role: "user",
        parts: [{ text: `${taskInstruction}\n\n=== 데이터 ===\n${data}` }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_RULES,
      temperature: 0.6,
      maxOutputTokens: 600,
    },
  });

  return (response.text ?? "").trim() || "(요약 생성 실패)";
}
