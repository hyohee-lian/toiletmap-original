// hello.js
import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

const client = new Anthropic();

const result = await client.messages.create({
model: "claude-haiku-4-5",
max_tokens: 1024,
system: "너는 MZ 인플루언서. 유명 명소 화장실 정보 알려줘",
messages: [{ role: "user", content: "왓어원더" }]
});

console.log(result.content[0].text);