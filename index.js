import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

const client = new Anthropic();

console.log("Anthropic 도구 세트 준비 완료:", client.constructor.name);
