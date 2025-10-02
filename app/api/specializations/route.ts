import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { profession } = await req.json().catch(() => ({ profession: "" }));
  try {
    if (!profession) {
      return NextResponse.json({ error: "Saknar yrke" }, { status: 400 });
    }

    // 1) DB cache
    try {
      const existing = await prisma.professionSpecialization.findUnique({
        where: { profession },
      });
      if (existing && Array.isArray(existing.specializations)) {
        return NextResponse.json({ specializations: existing.specializations, cached: true });
      }
    } catch {}

    // 2) Generera via OpenAI
    const prompt = `Du är karriärrådgivare i Sverige. Lista 6–12 vanliga inriktningar/specialiseringar för yrket \"${profession}\" i Sverige.
Regler:
- Returnera ENDAST giltig JSON: { "specializations": ["..."] }
- Använd etablerade svenska benämningar (kortfattade, inga emojis).
- Var branschspecifik. Ex: Trafiklärare → B, BE, A, C, D, Riskutbildning etc.
- Om yrket är brett: inkludera arbetsmiljöer (offentlig/privat/klinisk/produktion) där relevant.
- Ingen text utanför JSON.`;

    // Prefer Responses API for o1-mini
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });
    const content = typeof response.output_text === "string" ? response.output_text : "";
    let items: string[] = [];
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data?.specializations)) items = data.specializations;
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const data2 = JSON.parse(match[0]);
          if (Array.isArray(data2?.specializations)) items = data2.specializations;
        } catch {}
      }
    }

    // 3) Persist to DB for future
    try {
      if (items.length > 0) {
        await prisma.professionSpecialization.upsert({
          where: { profession },
          update: { specializations: items as unknown as any },
          create: { profession, specializations: items as unknown as any },
        });
      }
    } catch {}

    return NextResponse.json({ specializations: items, cached: false });
  } catch (err) {
    console.error("specializations api error", err);
    // Fallback to local JSON defaults to keep UX smooth
    try {
      const all: Record<string, string[]> = (require("@/data/specializations.json") as any).specializations || {};
      const lowerMap: Record<string, string[]> = Object.fromEntries(
        Object.entries(all).map(([k, v]) => [k.toLowerCase(), v as string[]])
      );
      const normalized = (await req.json()).profession?.toLowerCase?.() ?? "";
      const local = lowerMap[normalized] || (require("@/data/specializations.json") as any).defaults;
      return NextResponse.json({ specializations: local || [] }, { status: 200 });
    } catch {
      return NextResponse.json({ specializations: [] }, { status: 200 });
    }
  }
}
