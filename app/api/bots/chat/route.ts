import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { upsertHubspotContactStub } from "@/lib/integrations";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { botId, history } = await req.json();
    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404 });

    const system = `Du är en företagsbot. Följ specifikationen.\n\nSpec: ${JSON.stringify(bot.spec).slice(0, 4000)}\n\nBottype: ${bot.type}.\nknowledge:\n- svara bara utifrån context.\n- om saknas info: ställ precis en tydlig följdfråga.\nlead:\n- ställ i turordning: problem, mål/KPI, budgetintervall, tidsram, beslutsroll, nästa steg.\n- när allt är insamlat: gör en kort sammanfattning + CALL:WEBHOOK.\nsupport:\n- be om beskrivning, kategori, brådska, tidigare steg, kontaktinfo.\n- föreslå lösning + CALL:WEBHOOK.\n`;

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
      const payload = { botId: bot.id, history, reply };
      if ((bot.type === 'lead' || bot.type === 'support') && /CALL:WEBHOOK/i.test(reply) && !spec.requireApproval) {
        if (spec.webhookUrl) {
          await fetch(spec.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
        }
        if (spec.slackWebhook) {
          await fetch(spec.slackWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `Ny ${bot.type}-sammanfattning:\n\n${reply}` }) }).catch(() => {});
        }
        if (bot.type === 'lead' && spec.hubspotEnabled) {
          // naive parsing: hitta e‑post i historiken
          const text = JSON.stringify(history);
          const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
          if (m) {
            await upsertHubspotContactStub({ email: m[0] });
          }
        }
      } else if ((bot.type === 'lead' || bot.type === 'support') && /CALL:WEBHOOK/i.test(reply) && spec.requireApproval) {
        // Skapa approval request
        await prisma.approvalRequest.create({
          data: {
            botId: bot.id,
            type: bot.type,
            payload
          }
        });
      }
    } catch {}

    // Log usage (message)
    try {
      await prisma.botUsage.create({
        data: { botId: bot.id, kind: "message" }
      });
    } catch {}

    // Simple rate limit for free plan: max 50 messages per day per bot
    try {
      const spec: any = bot.spec || {};
      const isFree = spec.plan !== 'pro';
      if (isFree) {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const count = await prisma.botUsage.count({ where: { botId: bot.id, createdAt: { gte: since }, kind: 'message' } });
        if (count > 50) {
          return NextResponse.json({ reply: 'Gratisgränsen är nådd för idag. Uppgradera för mer kapacitet.' });
        }
      }
    } catch {}

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("chat error", e);
    return NextResponse.json({ error: "chat failed" }, { status: 500 });
  }
}


