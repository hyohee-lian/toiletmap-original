import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
import readline from "node:readline/promises";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "너는 서울 관악구 유명 맛집, 카페, 술집 화장실 정보를 알고 있는 데이터 수집가야. user가 매장명을 검색하면 화장실 사진을 포함한 정보를 요약해 알려줘야해";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("매장명을 입력하세요. 종료하려면 q 를 입력하세요.\n");

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
