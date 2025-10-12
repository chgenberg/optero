import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { evalId } = await req.json();
    if (!evalId) return NextResponse.json({ error: 'evalId required' }, { status: 400 });
    const e = await prisma.botEval.findUnique({ where: { id: evalId } });
    if (!e) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const bot = await prisma.bot.findUnique({ where: { id: e.botId } });
    if (!bot) return NextResponse.json({ error: 'bot_not_found' }, { status: 404 });

    const specSafe = JSON.stringify(bot.spec).slice(0, 3000);
    const messages = [
      { role: 'system', content: `Du är en företagsbot. Följ specifikation och bottype. Spec: ${specSafe}` },
      { role: 'user', content: e.input }
    ] as any[];

    const resp = await openai.chat.completions.create({ model: 'gpt-5-mini', messages, max_completion_tokens: 300 });
    const reply = resp.choices[0]?.message?.content || '';
    const pass = new RegExp(e.expectedMatch, 'i').test(reply);
    const saved = await prisma.botEval.update({ where: { id: e.id }, data: { lastRunAt: new Date(), lastPass: pass, lastReply: reply } });
    return NextResponse.json({ ok: true, result: saved });
  } catch (err: any) {
    return NextResponse.json({ error: 'run_failed' }, { status: 500 });
  }
}


