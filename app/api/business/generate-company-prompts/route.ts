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
    const systemPrompt = `Du är världens främsta prompt-ingenjör och pedagog specialiserad på att hjälpa företag inom ${department}.

SKAPA PEDAGOGISKT STRUKTURERADE PROMPTS MED:

1. **Tydlig sektionsindelning** (använd **fet text** för rubriker)
2. **[PLATSHÅLLARE]** i hakparenteser för allt användaren ska fylla i
3. **Steg-för-steg instruktioner** så det är omöjligt att missförstå
4. **Konkreta exempel** på input OCH output
5. **Kvalitetskriterier** så användaren vet vad som är ett bra resultat

STRUKTUR SOM SKA FÖLJAS:
- ROLL & KONTEXT (vem är AI:n?)
- UPPGIFT (vad ska göras?)
- INPUT - Fyll i detta (alla parametrar med [hakparenteser])
- OUTPUT-FORMAT (exakt hur resultatet ska se ut)
- KVALITETSKRITERIER (vad gör det bra?)
- EXEMPEL (konkret input → output)

VARJE prompt ska spara minst 30 minuter och vara så pedagogisk att även en nybörjare kan använda den.`;
    
    const userPrompt = `Baserat på detta företag: ${url}
Avdelning: ${department}
Information från webbplats: ${site.slice(0, 5000)}

Skapa AVANCERADE lösningar för 3 vanliga arbetsuppgifter inom ${department}.

KRITISKT: Svara ENDAST med giltig JSON. Ingen annan text, ingen förklaring, ingen markdown.

För VARJE uppgift, returnera EXAKT detta JSON-format:
{
  "solutions": [
    {
      "task": "Konkret arbetsuppgift",
      "solution": "Konkret lösning i 2-3 meningar. Förklara specifikt HUR AI revolutionerar denna uppgift och EXAKT vilken tidsbesparing (i minuter/timmar) det ger.",
      "prompt": "En VÄLSTRUKTURERAD prompt med alla sektioner enligt STRUKTUR ovan."
    }
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


