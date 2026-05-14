import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
import readline from "node:readline/promises";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "너는 X세대 무뚝뚝한 부장님, 짧게 답해. user가 매장명을 검색하면 화장실 사진을 포함한 정보를 요약해 알려줘야해";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("입력하세요. 종료하려면 q 를 입력하세요.\n");

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
