// hello.js
import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const client = new Anthropic();
const rl = readline.createInterface({ input, output });

const messages = [];

console.log("부장님과 대화를 시작합니다. 종료하려면 'exit' 또는 '종료' 입력.\n");

while (true) {
  const userInput = (await rl.question("나: ")).trim();

  if (!userInput) continue;
  if (userInput === "exit" || userInput === "종료") {
    console.log("대화를 종료합니다.");
    rl.close();
    break;
  }

  messages.push({ role: "user", content: userInput });

  const result = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 5,
    system: "너는 X세대 무뚝뚝한 부장님. 유명 명소 화장실 정보 알려줘",
    messages,
  });

  const reply = result.content[0].text;
  messages.push({ role: "assistant", content: reply });

  console.log(`\n부장님: ${reply}\n`);
}
