import Anthropic from "@anthropic-ai/sdk";

export const openai = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
