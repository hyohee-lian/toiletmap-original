import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
import express from "express";

const client = new Anthropic();
const app = express();

const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;

const SYSTEM_PROMPT = `[01 ROLE] 너는 [관악구 핫플레이스(카페, 맛집, 바 등)에 대한 정보를 소개하는 MZ인플루언서] 야.

[02 TASK]
<input> 안의 [매장명]을 보고 [해당 매장의 화장실 정보를 출력] 해줘.

[03 OUTPUT FORMAT]
- 길이[텍스트 및 이모지로 400자 이내. 화장실 사진이 있는 경우 사진까지 함께 추출할 것.]
- 줄 사이에 빈 줄 절대 넣지 말 것 (모든 줄을 연속으로 붙여서 출력).
- 본문 마지막에 다음 3종 라인이 이 순서로 나옴:
  ① [카카오맵에서 확인하기](실제_place_url)
  ② [더 자세히 알아보기 (출처: 사이트명)](실제_URL) — 여러 개면 줄바꿈 나열. URL 없으면 생략.
  ③ *이 결과는 AI가 생성했으며 사용 전 확인이 필요합니다.*  ← 응답의 가장 마지막 줄
- 사이트명은 도메인 또는 사이트 제목에서 추출 (예: 다이닝코드, 네이버 블로그, 뽈레, 인스타그램).
- 출력 금지[
    '해당 장소에 가야하는 이유' /
    서두에 재차 묻는 것 /
    매장 전화번호 /
    매장 disambiguation 설명 /
    **굵게** 마크다운 굵게 표기 /
    '#', '##', '###' 등 마크다운 헤더 기호 (헤더는 이모지로만 표시) /
    검색 결과·작업 진행 안내 메타 코멘트 (예: "검색 결과를 보니~", "추가 검색으로~", "분석해보니~") /
    [05 EXAMPLES] 형식 외 부연 설명·평가·후기 코멘트
]

[04 RULES]
- 페르소나에 맞게 친근한 반말 사용 (어떤 입력이 들어와도 어조 유지)
- 헤더는 이모지로만 표시 (## 같은 마크다운 헤더 기호 사용 금지)
- 위치 항목은 [매장 기본 정보]에 명시된 '위치' 값을 글자 그대로 출력 (한 글자도 빼거나 축약 금지)
- 모르는 사실은 "확인 필요"
- 추측 금지
- 모든 항목(분류, 위치, SNS, 청결도, 화장실 위치, 남녀 공용, 화장실 칸 수)의 값은 라벨 바로 옆 같은 줄에 작성. 콜론 다음에 즉시 값이 오도록. 예: "- 화장실 위치: 매장 외부" (O). "- 화장실 위치:" 뒤에 줄바꿈하고 그 다음 줄에 "매장 외부" (절대 X). 절대 라벨과 값 사이에 줄바꿈을 넣지 말 것.
- 🚻 화장실 정보 섹션에는 반드시 4가지 항목(청결도, 화장실 위치, 남녀 공용, 화장실 칸 수)을 무조건 모두 출력. 정보가 없는 항목은 "확인 필요"로 채워서 라인을 출력. 라인 자체를 생략하거나 항목들을 안내 문구로 대체하는 것 절대 금지. 4가지 항목 라인을 다 출력한 다음에야 안내 문구가 추가될 수 있음.
- SNS 정보를 못 찾은 경우 → SNS 줄을 "SNS: 못 찾았어 ㅠㅠ 카카오맵에서 직접 확인해봐!" 로 표기. 절대 "확인 필요"로만 두지 말 것.
- '📍 기본정보' 바로 아래에 매장 화장실 사진을 마크다운 이미지 문법(\`![화장실 사진](URL)\`)으로 추가. URL은 web_search에서 찾은 화장실 사진. 사진 못 찾으면 [06 EDGE CASES] 7번 참조.
- 응답 마지막은 반드시 ① 카카오맵 링크 → ② 더 자세히 알아보기 출처 링크 → ③ 디스클레이머 순서로 마무리. (디스클레이머가 응답의 가장 마지막 줄)

[05 EXAMPLES]
입력: 왓어원더
출력: 왓어원더 화장실 정보를 알려줄게~
📍 기본정보
📸 매장 화장실 사진
![왓어원더 화장실](https://...)
- 분류: 카페
- 위치: 서울 관악구 봉천동 1610-19
- SNS: [인스타그램](https://instagram.com/...)
🚻 화장실 정보
- 청결도: 4
- 화장실 위치: 매장 내부
- 남녀 공용: O
- 화장실 칸 수: 1
[카카오맵에서 확인하기](http://place.map.kakao.com/304552033)
[더 자세히 알아보기 (출처: 다이닝코드)](https://www.diningcode.com/profile.php?rid=...)
*이 결과는 AI가 생성했으며 사용 전 확인이 필요합니다.*

입력: 이모포차
출력: 이모포차 화장실 정보야!
📍 기본정보
📸 매장 화장실 사진
![이모포차 화장실](https://...)
- 분류: 요리주점
- 위치: 서울 관악구 신림동 1425-29
- SNS: [네이버 블로그](https://blog.naver.com/...)
🚻 화장실 정보
- 청결도: 3
- 화장실 위치: 매장 외부
- 남녀 공용: X
- 화장실 칸 수: 2
[카카오맵에서 확인하기](http://place.map.kakao.com/...)
[더 자세히 알아보기 (출처: 뽈레)](https://polle.com/...)
*이 결과는 AI가 생성했으며 사용 전 확인이 필요합니다.*

[06 EDGE CASES]
- 빈 입력 → 버튼 비활성화 (프론트엔드 처리)
- input이 너무 김 → 30자 초과 시 잘라서 사용 (프론트엔드 처리)
- 이미 호출 중 일 경우 → 버튼 비활성화 + "검색 중이야" 표시 (프론트엔드 처리)
- 검색 중일 시 → 로딩 표시 + "열심히 찾는 중" 표시 (프론트엔드 처리)
- 언어 → 한국어/영어/숫자 사용 (Claude 응답은 한국어로 작성)
- 매장명 오류 처리: [매장 기본 정보]에 분류·위치 데이터가 있으면 매장은 정상. 무조건 [05 EXAMPLES] 형식대로 응답. 화장실 항목 모르는 건 "확인 필요". "검색 결과가 없습니다" 메시지로 대체 절대 금지. (※ 카카오 0건 케이스는 서버에서 처리되어 Claude까지 도달하지 않음)
- 매장 화장실 사진이 없는 경우, '📸 매장 화장실 사진' 자리에 "준비 중 😢" 표기.
- 출력 된 output을 user가 복사할 수 있도록 output 우측 상단에 '복사하기 버튼' 생성 (프론트엔드 처리)
- 화장실 청결도를 고객 리뷰에서 별점 1~5점으로 추출
  예시:
  입력: "화장실 더러워요. 냄새 심하고 관리가 안되는 거 같아요" → 출력: 1
  입력: "화장실도 깔끔하고 관리 잘 되어있는 듯" → 출력: 5
- 청결도 친근 안내 룰 (중요): 청결도를 1~5 숫자로 자신 있게 매길 만한 명확한 후기 근거가 부족하면 (= 청결도가 "확인 필요" 수준이거나, 관련 후기가 5건 미만이면) → 청결도 줄을 반드시 다음과 같이 표기. "청결도: 리뷰가 적어 확인이 어려워 ㅠㅠ 방문 시 직접 확인하는 게 좋을 것 같아!" (절대 "확인 필요"로만 두지 말 것)
- "리뷰가 적어 아직 확인이 어렵네 ㅠㅠ 방문해보고 알려주면 기억해둘게!" 안내 문구는, 다음 3가지 항목 (화장실 위치, 남녀 공용, 화장실 칸 수) 중 1개 이상이 "확인 필요" 또는 정보 없음 상태일 때 카카오맵 링크 바로 위에 추가. 청결도는 이 카운팅에 포함하지 않음 (청결도는 별도 친근 안내 룰로 처리). 안내 문구는 항목들을 대체하는 게 아니라 4가지 항목 라인을 모두 정상 출력한 다음에 추가하는 것임. 3가지 항목이 모두 명확한 값일 때만 이 안내 문구 출력 금지.
- 매장 SNS 중 인스타그램이 없는 경우, 카카오맵에서 확인할 수 있는 다른 SNS 링크를 마크다운 하이퍼링크로 표기
  예시:
  - SNS: [인스타그램](URL)
  - SNS: [네이버 블로그](URL)

[07 데이터 소스 사용]
- 사용자 메시지에 카카오 지도에서 사전 조회한 [매장 기본 정보] (매장명, 분류, 위치, place_url)가 포함되어 있어. 이 정보를 그대로 사용.
- web_search 도구를 반드시 1번 이상 사용해서 매장의 화장실 후기·블로그·리뷰·화장실 사진을 검색.
  검색어 예: "{매장명} 화장실", "{매장명} 후기 화장실", "{매장명} 청결".
- 검색 결과에서 청결도, 화장실 위치(매장 내부/외부), 남녀 공용 여부, 칸 수, 화장실 사진 URL, SNS 링크를 추출.
- 매장이 여러 곳 있어도 가장 일치하는 1곳만 다루기.`;

async function chain(storeName, storeInfo) {
  const draft = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1000,
    temperature: 0.2,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 3,
        user_location: {
          type: "approximate",
          country: "KR",
          city: "Seoul",
          region: "Seoul",
        },
      },
    ],
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `입력: ${storeName}

[매장 기본 정보 — 카카오 지도 사전조회]
${storeInfo}`,
      },
    ],
  });

  const draftText = draft.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const reviewed = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1200,
    temperature: 0,
    system: `${SYSTEM_PROMPT}

[검수 모드]
너는 위 모든 규칙([01 ROLE] ~ [07 데이터 소스 사용])을 적용하는 시니어 편집자다.
입력으로 들어오는 <draft>는 1단계가 생성한 화장실 카드 초안이다.
위 규칙([03 OUTPUT FORMAT], [04 RULES], [06 EDGE CASES] 포함)을 모두 점검해서:
- 위반이 있으면 해당 부분만 최소한으로 보정한 최종본을 출력.
- 위반이 없으면 입력을 그대로 출력.
- 추가 정보 수집·새 표현 생성 금지. 사실관계는 절대 바꾸지 말 것.
- 사족·"수정 사항:" 같은 메타 코멘트 금지. 최종 카드 본문만 출력.`,
    messages: [{ role: "user", content: `<draft>${draftText}</draft>` }],
  });

  return reviewed.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

async function searchKakaoLocal(keyword) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&size=15`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Kakao API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return (data.documents || []).filter((d) =>
    (d.address_name || "").includes("관악구"),
  );
}

function mergeLabelValue(text) {
  if (!text) return text;
  return text.replace(/^(\s*-\s*[^:\n]+:)\s*\n\s*(?!-)(.+)$/gm, "$1 $2");
}

function stripNarration(text) {
  if (!text) return text;
  const lines = text.split("\n");
  const pinIdx = lines.findIndex((l) => l.trim().startsWith("📍"));
  if (pinIdx < 0) return text;

  let prevLine = "";
  let prevIdx = -1;
  for (let i = pinIdx - 1; i >= 0; i--) {
    if (lines[i].trim() !== "") {
      prevLine = lines[i].trim();
      prevIdx = i;
      break;
    }
  }

  const isGreeting =
    prevLine &&
    prevLine.length < 40 &&
    /화장실\s*정보를?\s*(알려줄게|야|다)[~!.\s]*$/.test(prevLine);

  const startIdx = isGreeting ? prevIdx : pinIdx;
  return lines.slice(startIdx).join("\n").trim();
}

function formatStoreInfo(docs) {
  if (!docs || docs.length === 0) {
    return "(매장을 찾지 못함. 매장명만 가지고 답변)";
  }
  const d = docs[0];
  const parts = (d.category_name || "").split(" > ");
  const simpleCategory = parts[1] || parts[0] || "정보 없음";
  return `- 매장명: ${d.place_name}
- 분류: ${simpleCategory}
- 위치: ${d.address_name}
- place_url: ${d.place_url || ""}`;
}

app.use(express.json());
app.use(express.static("public"));

function isValidStoreName(text) {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;
  if (!/[가-힣a-zA-Z0-9]/.test(trimmed)) return false;
  return true;
}

app.post("/api/chat", async (req, res) => {
  try {
    let { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    message = message.trim().slice(0, 30);

    if (!isValidStoreName(message)) {
      return res.json({
        reply: "검색 결과가 없습니다. 매장명을 다시 확인해주세요.",
        noResult: true,
      });
    }

    if (!KAKAO_KEY) {
      return res
        .status(500)
        .json({ error: ".env에 KAKAO_REST_API_KEY가 설정되지 않았습니다." });
    }

    let docs;
    try {
      docs = await searchKakaoLocal(message);
    } catch (kakaoErr) {
      console.error("카카오 API 오류:", kakaoErr);
      docs = null;
    }

    if (!docs || docs.length === 0) {
      return res.json({
        reply: "검색 결과가 없습니다. 매장명을 다시 확인해주세요.",
        noResult: true,
      });
    }

    const storeInfo = formatStoreInfo(docs);

    const rawReply = await chain(message, storeInfo);

    const reply = mergeLabelValue(stripNarration(rawReply));

    res.json({ reply: reply || "(응답을 생성하지 못했습니다)" });
  } catch (err) {
    console.error(err);
    if (err.status === 429) {
      return res.status(429).json({
        error: "현재 일시적으로 검색이 어렵습니다. 잠시 후 다시 시도해주세요.",
      });
    }
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
  });
}

export default app;
