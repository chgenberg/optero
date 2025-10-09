import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 1,
  timeout: 180000
});
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  try {
    const { url, department, content } = await req.json();
    if (!url || !department || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const site = (content || "").slice(0, 12000);
    const combinedPrompt = `Du är en världsklass AI‑strateg och prompt‑ingenjör som skapar praktiska, direkt användbara prompts åt företag.

FÖRETAG: ${url}
AVDELNING: ${department}
UTDRAG FRÅN WEBBPLATS (komprimerat):\n${site}

MÅL: Generera 3 specifika, högvärdiga användningsfall för AI i denna avdelnings dagliga arbete.

KRAV:
- Returnera ENDAST giltig JSON enligt formatet nedan (ingen extra text eller kodblock)
- Varje förslag ska innehålla: {task, solution, prompt}
- prompt ska ha tydlig struktur med **ROLL & KONTEXT**, **UPPGIFT**, **INPUT – Fyll i detta** (max 3 placeholders), **OUTPUT-FORMAT**, **KVALITETSKRITERIER**, **FÄRDIGT EXEMPEL** (ifyllt för detta företag utifrån rimliga antaganden)
- Anta rimliga standarder om något saknas; minimera [PLACEHOLDERS]

OUTPUTFORMAT (JSON):\n{ "solutions": [ { "task": string, "solution": string, "prompt": string }, { ... }, { ... } ] }`;

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "user", content: combinedPrompt }
        ],
        max_completion_tokens: 2500
      });
    } catch (err: any) {
      console.error("OpenAI gpt-5 error:", err?.message, err?.status, err?.code, err?.response?.data || err);
      return NextResponse.json({ 
        error: "OpenAI request failed",
        message: err?.message,
        status: err?.status || err?.response?.status,
        code: err?.code || err?.response?.data?.error?.code,
        response: err?.response?.data || null
      }, { status: 500 });
    }

    const contentRaw = completion.choices?.[0]?.message?.content || "{}";
    const match = contentRaw.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    const cleaned = match ? match[1] : contentRaw;
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Invalid JSON from model:", contentRaw?.slice(0, 500));
      return NextResponse.json({ error: "Invalid JSON from model", raw: contentRaw?.slice(0, 1000) }, { status: 500 });
    }
    // Normalize various possible shapes into { solutions: [...] }
    const candidateKeys = [
      'solutions','items','ideas','useCases','use_cases','prompts','recommendations','outputs','results'
    ];
    let list: any = Array.isArray(parsed) ? parsed : null;
    if (!list) {
      for (const k of candidateKeys) {
        if (parsed && Array.isArray((parsed as any)[k])) { list = (parsed as any)[k]; break; }
      }
    }
    if (!list) {
      // If the object has values that are arrays, take the first array
      const firstArray = Object.values(parsed).find(v => Array.isArray(v));
      if (firstArray) list = firstArray as any[];
    }

    if (!list || list.length === 0) {
      console.error("Model returned JSON without solutions array:", JSON.stringify(parsed).slice(0, 500));
      return NextResponse.json({ error: "No solutions in model output", raw: parsed }, { status: 500 });
    }

    const normalized = (list as any[]).slice(0, 3).map((it: any, idx: number) => {
      if (typeof it === 'string') {
        return {
          task: `Förslag ${idx+1}`,
          solution: it,
          prompt: `**ROLL & KONTEXT:**\nDu är ansvarig för ${department}.\n\n**UPPGIFT:**\n${it}\n\n**INPUT – Fyll i detta:**\nMål: [ange]\nSystem: [ange]\n\n**OUTPUT-FORMAT:**\n1) steg\n2) exempel\n\n**FÄRDIGT EXEMPEL:**\nAnvänd rimliga antaganden för ${url}.`
        };
      }
      return {
        task: it.task || it.title || it.name || `Förslag ${idx+1}`,
        solution: it.solution || it.summary || it.description || it.value || "",
        prompt: it.prompt || it.instructions || it.guide || ""
      };
    });

    return NextResponse.json({ solutions: normalized });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}


