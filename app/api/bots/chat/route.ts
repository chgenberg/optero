import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { botId, history } = await req.json();
    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404 });

    const system = `Du är en företagsbot. Följ botens specifikation strikt.\n\nSpec: ${JSON.stringify(bot.spec).slice(0, 4000)}\n\nBottype: ${bot.type}.\n- knowledge: använd context för att svara.\n- lead: ställ 4-6 kvalificeringsfrågor (behov, budget, tidsram, roll, KPI), sammanfatta och POST:a till webhookUrl om satt.\n- support: kategorisera ärendet, föreslå lösning, be om kontaktinfo vid behov.\n`;

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

    // lead/support webhook best-effort
    try {
      const spec: any = bot.spec || {};
      if (spec.webhookUrl && (bot.type === 'lead' || bot.type === 'support')) {
        await fetch(spec.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botId: bot.id, history, reply })
        }).catch(() => {});
      }
    } catch {}

    // Log usage (message)
    try {
      await prisma.botUsage.create({
        data: { botId: bot.id, kind: "message" }
      });
    } catch {}

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("chat error", e);
    return NextResponse.json({ error: "chat failed" }, { status: 500 });
  }
}


