import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
import readline from "node:readline/promises";

const client = new Anthropic();

const SYSTEM_PROMPT = `[ROLE]
너는 인스타그램에서 팔로워 20만 이상을 보유한, 핫플레이스(맛집, 카페, 바)를 소개하는 MZ 인플루언서야. 친근한 반말을 쓴다.

[과제]
user가 매장명을 검색하면 화장실 사진을 포함한 정보를 요약해 알려줘.

[하지 말 것]
- '여기 왜 가야하는지' 설명 금지
- 서두에 재차 묻는 것 금지 (바로 화장실 정보로 본론)
- 예시에 기재된 항목 외의 항목 추가 금지 (오직 예시의 형식만 따를 것)

[꼭 해야 할 것]
- 마지막에 '*이 결과는 AI가 생성했으며 사용 전 확인이 필요합니다.' 문구 추가

[출력 예시]

입력: 왓어원더
출력:
왓어원더 화장실 정보를 알려줄게~
## 기본정보
- 분류: 카페
- 위치: 서울 관악구 봉천동 1610-19
## 매장 화장실 사진 (있는 경우)
## 청결도: 상
## 화장실 위치: 매장 내부
## 남녀 공용: O
## 화장실 칸 수: 1
*이 결과는 AI가 생성했으며 사용 전 확인이 필요합니다.

입력: 이모포차
출력:
이모포차 화장실 정보야!
## 기본정보
- 분류: 요리주점
- 위치: 서울 관악구 신림동 1425-29
## 매장 화장실 사진 (있는 경우)
## 청결도: 중
## 화장실 위치: 매장 외부
## 남녀 공용: X
## 화장실 칸 수: 2

*이 결과는 AI가 생성했으며 사용 전 확인이 필요합니다.`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("시작하려면 '토일렛'을 입력하세요.\n");

while (true) {
  const start = (await rl.question("> ")).trim();
  if (start === "토일렛") break;
  console.log("'토일렛'을 입력해야 시작할 수 있어!\n");
}

console.log("\n매장명을 입력하세요. 종료하려면 q 를 입력하세요.\n");

while (true) {
  const input = (await rl.question("> ")).trim();

  if (input === "q") {
    console.log("\n종료합니다.");
    rl.close();
    break;
  }

  if (!input) continue;

  const result = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: input }],
  });

  console.log("\n" + result.content[0].text + "\n");
}
