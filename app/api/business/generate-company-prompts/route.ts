import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  try {
    const { url, department, content } = await req.json();
    if (!url || !department || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const system = `Du är en världsklass AI‑strateg och prompt‑ingenjör som skapar praktiska, direkt användbara prompts åt företag.`;
    const user = `FÖRETAG: ${url}
AVDELNING: ${department}
UTDRAG FRÅN WEBBPLATS (komprimerat):\n${content.slice(0, 100000)}

MÅL: Generera 3 specifika, högvärdiga användningsfall för AI i denna avdelnings dagliga arbete.

KRAV:
- Varje förslag ska innehålla: {task, solution, prompt}
- prompt ska ha tydlig struktur med **ROLL & KONTEXT**, **UPPGIFT**, **INPUT – Fyll i detta** (max 3 placeholders), **OUTPUT-FORMAT**, **KVALITETSKRITERIER**, **FÄRDIGT EXEMPEL** (ifyllt för detta företag utifrån antaganden)
- Anta rimliga standarder om något saknas; minimera [PLACEHOLDERS]

Returnera ENDAST JSON:
{ "solutions": [ { "task": string, "solution": string, "prompt": string }, ... ] }`;

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        max_completion_tokens: 3000,
      });
    } catch (e) {
      // Fallback to gpt-5-mini if main model fails
      completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        max_completion_tokens: 3000,
      });
    }

    const contentRaw = completion.choices[0].message.content || "{}";
    const match = contentRaw.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    const cleaned = match ? match[1] : contentRaw;
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON from model", raw: contentRaw.slice(0, 1000) }, { status: 500 });
    }
    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}


