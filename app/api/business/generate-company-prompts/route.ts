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
    const systemPrompt = `Du är expert på AI-lösningar för ${department}-avdelningar. Du skapar praktiska prompts som sparar tid. Svara ENDAST med giltig JSON.`;
    
    const userPrompt = `Företag: ${url}
Avdelning: ${department}
Webbplats-info: ${site.slice(0, 3000)}

Skapa 3 specifika AI-användningsfall för ${department} baserat på företagets kontext.

KRAV PER LÖSNING:
- task: konkret arbetsuppgift (t.ex. "Skriva jobbeskrivningar", "Analysera medarbetarfeedback")
- solution: 2-3 meningar om HUR AI hjälper och tidsbesparing i minuter/timmar
- prompt: välstrukturerad med dessa sektioner (använd **fet text** för rubriker):
  **ROLL & KONTEXT:** [vem är AI:n?]
  **UPPGIFT:** [vad ska göras?]
  **INPUT - Fyll i detta:** [max 3 fält med [hakparenteser]]
  **OUTPUT-FORMAT:** [hur ska resultatet se ut?]
  **EXEMPEL:** [konkret scenario med ifyllda värden]

Returnera ENDAST JSON enligt exakt detta format:
{
  "solutions": [
    { "task": string, "solution": string, "prompt": string },
    { "task": string, "solution": string, "prompt": string },
    { "task": string, "solution": string, "prompt": string }
  ]
}`;

    let completion;
    try {
      // Chat Completions API med gpt-5-mini (samma som privatflödet)
      completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 3000
      });
    } catch (err: any) {
      console.error("OpenAI gpt-5-mini error:", err?.message, err?.status, err?.code, err?.response?.data || err);
      return NextResponse.json({ 
        error: "OpenAI request failed",
        message: err?.message,
        status: err?.status || err?.response?.status,
        code: err?.code || err?.response?.data?.error?.code,
        response: err?.response?.data || null
      }, { status: 500 });
    }

    // Chat Completions: use message.content
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

    // Last-resort: ask a smaller model to coerce any text into our schema
    if (!list || list.length === 0) {
      try {
        const coerce = await openai.chat.completions.create({
          model: "gpt-5-mini",
          messages: [
            { role: "user", content: `Konvertera följande innehåll till exakt JSON enligt:\n{ "solutions": [ { "task": string, "solution": string, "prompt": string }, {..}, {..} ] }\n\nINNEHÅLL:\n${contentRaw}` }
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 1200
        });
        const coerceRaw = coerce.choices?.[0]?.message?.content || "{}";
        const coerceMatch = coerceRaw.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        const coerceClean = coerceMatch ? coerceMatch[1] : coerceRaw;
        const coerced = JSON.parse(coerceClean);
        if (Array.isArray(coerced?.solutions) && coerced.solutions.length) {
          return NextResponse.json({ solutions: coerced.solutions.slice(0,3) });
        }
      } catch (e) {
        console.error("Coercion step failed", e);
      }

      // Second fallback: regenerate fresh with gpt-5-mini
      try {
        const regen = await openai.chat.completions.create({
          model: "gpt-5-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 2500
        });
        const regenRaw = regen.choices?.[0]?.message?.content || "{}";
        const regenParsed = JSON.parse(regenRaw);
        if (Array.isArray(regenParsed?.solutions) && regenParsed.solutions.length) {
          return NextResponse.json({ solutions: regenParsed.solutions.slice(0,3) });
        }
      } catch (e) {
        console.error("Regen step failed", e);
      }

      console.error("Model returned JSON without solutions array:", JSON.stringify(parsed).slice(0, 500));
      console.error("Raw contentRaw:", contentRaw?.slice(0, 800));
      return NextResponse.json({ 
        error: "No solutions in model output", 
        raw: parsed,
        rawText: contentRaw?.slice(0, 1000),
        parsedKeys: Object.keys(parsed || {})
      }, { status: 500 });
    }

    // Clean helper
    const cleanStr = (s: string) => (s || "").replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim();

    const normalized = (list as any[]).slice(0, 3).map((it: any, idx: number) => {
      if (typeof it === 'string') {
        return {
          task: `Förslag ${idx+1}`,
          solution: cleanStr(it),
          prompt: `**ROLL & KONTEXT:**\nDu är ansvarig för ${department}.\n\n**UPPGIFT:**\n${cleanStr(it)}\n\n**INPUT – Fyll i detta:**\nMål: [ange]\nSystem: [ange]\n\n**OUTPUT-FORMAT:**\n1) steg\n2) exempel\n\n**FÄRDIGT EXEMPEL:**\nAnvänd rimliga antaganden för ${url}.`
        };
      }
      return {
        task: cleanStr(it.task || it.title || it.name || `Förslag ${idx+1}`),
        solution: cleanStr(it.solution || it.summary || it.description || it.value || ""),
        prompt: cleanStr(it.prompt || it.instructions || it.guide || "")
      };
    });

    return NextResponse.json({ solutions: normalized });
  } catch (e: any) {
    console.error("Top-level catch in generate-company-prompts:", e);
    return NextResponse.json({ 
      error: e?.message || "Failed", 
      stack: e?.stack?.slice(0, 500),
      type: e?.constructor?.name 
    }, { status: 500 });
  }
}


