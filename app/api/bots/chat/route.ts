import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { botId, history } = await req.json();
    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404 });

    const system = `Du är en företagsbot. Följ botens specifikation strikt.\n\nSpec: ${JSON.stringify(bot.spec).slice(0, 4000)}`;

    const messages = [
      { role: "system", content: system },
      ...history.map((m: any) => ({ role: m.role, content: m.content }))
    ] as any[];

    const resp = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages,
      max_completion_tokens: 500
    });

    const reply = resp.choices[0]?.message?.content || "";
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("chat error", e);
    return NextResponse.json({ error: "chat failed" }, { status: 500 });
  }
}


