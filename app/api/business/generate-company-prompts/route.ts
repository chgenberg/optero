import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 1,
  timeout: 300000 // 5 minutes for GPT-5 (o1 needs more time to think)
});
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { url, department, content } = await req.json();
    if (!url || !department || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const site = (content || "").slice(0, 12000);
    const systemPrompt = `Du är expert på AI-lösningar för ${department}-avdelningar. Du skapar praktiska, välstrukturerade prompts som sparar tid och ger tydliga resultat. Svara ENDAST med giltig JSON.`;
    
    const userPrompt = `Företag: ${url}
Avdelning: ${department}
Webbplats-info: ${site.slice(0, 3000)}

Skapa 3 specifika AI-användningsfall för ${department} baserat på företagets kontext.

KRAV PER LÖSNING:
- task: konkret arbetsuppgift (t.ex. "Skriva jobbeskrivningar", "Analysera medarbetarfeedback")
- solution: 2-3 meningar om HUR AI hjälper och tidsbesparing i minuter/timmar
- prompt: välstrukturerad med dessa sektioner (använd **fet text** för rubriker och radbrytningar mellan sektioner):
- recommendedTool: vilket AI-verktyg som passar bäst ("ChatGPT 4", "Claude 3", "Gemini Pro", eller "Perplexity")

PROMPT-FORMAT (använd exakt denna struktur med radbrytningar):
**ROLL & KONTEXT:**
[Beskriv AI:ns roll och företagsspecifik kontext]

**UPPGIFT:**
[Vad ska göras - tydligt och konkret]

**INPUT - Fyll i detta:**
[PLACEHOLDER1]: [Beskrivning]
[PLACEHOLDER2]: [Beskrivning]
[PLACEHOLDER3]: [Beskrivning om behövs]

**OUTPUT-FORMAT:**
Leverera:
1) [Första delen - vad]
2) [Andra delen - vad]
3) [Tredje delen - vad]
4) [Fjärde delen om relevant]

**EXEMPEL:**
Input:
[PLACEHOLDER1]: [Konkret exempelvärde]
[PLACEHOLDER2]: [Konkret exempelvärde]

Output:
[Visa exakt hur resultatet ser ut med konkreta värden, formaterat som det ska levereras]

Returnera ENDAST JSON enligt exakt detta format:
{
  "solutions": [
    { "task": string, "solution": string, "prompt": string, "recommendedTool": string },
    { "task": string, "solution": string, "prompt": string, "recommendedTool": string },
    { "task": string, "solution": string, "prompt": string, "recommendedTool": string }
  ]
}`;

    // Helper: always-available local fallback (no OpenAI dependency)
    const buildFallback = () => {
      const mkPrompt = (task: string, body: string) => (
        `**ROLL & KONTEXT:**\nDu arbetar på avdelningen ${department} på ${url}.\n\n**UPPGIFT:**\n${body}\n\n**INPUT - Fyll i detta:**\n[MÅL]: Vad vill ni uppnå\n[KÄLLA]: Länkar/dokument\n[FORMAT]: Hur ni vill ha resultatet\n\n**OUTPUT-FORMAT:**\n1) Sammanfattad analys\n2) Handlingslista\n3) Mätetal/uppföljning\n\n**EXEMPEL:**\nInput:\n[MÅL]: Snabbare process\n[KÄLLA]: Webbplats + interna dokument\n[FORMAT]: Checklista\n\nOutput:\n1. Analys...\n2. Åtgärder...\n3. KPI: tid/vecka, felgrad`
      );
      const bases = [
        {
          task: `AI-assisterad arbetsflödesanalys för ${department}`,
          solution: `Analysera ert nuvarande arbetssätt med AI och identifiera flaskhalsar samt steg som kan automatiseras. Ger en konkret åtgärdsplan och uppskattad tidsbesparing per vecka.`,
        },
        {
          task: `Automatiserad sammanställning av ${department}-underlag` ,
          solution: `Låt AI samla, strukturera och sammanfatta underlag från webbplats och dokument till handlingsbara punkter. Minskar manuellt arbete och ökar kvalitet.`,
        },
        {
          task: `Standardiserade mallar och checklistor för ${department}`,
          solution: `Skapa AI-drivna mallar/checklistor anpassade för ert team. Säkerställer konsekvens, påskyndar leverans och underlättar onboarding.`,
        }
      ];
      return bases.map(b => ({
        task: b.task,
        solution: b.solution,
        prompt: mkPrompt(b.task, b.solution),
        recommendedTool: "ChatGPT 4",
      }));
    };

    let completion;
    try {
      // Chat Completions API med gpt-5-mini (beprövat och fungerar)
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
      const fallback = buildFallback();
      // Persist fallback
      try {
        await prisma.businessSolution.createMany({
          data: fallback.map((s: any) => ({ companyUrl: url, department, task: s.task, solution: s.solution, prompt: s.prompt, recommendedTool: s.recommendedTool })),
        });
      } catch {}
      return NextResponse.json({ solutions: fallback });
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
      const fallback = buildFallback();
      try {
        await prisma.businessSolution.createMany({
          data: fallback.map((s: any) => ({ companyUrl: url, department, task: s.task, solution: s.solution, prompt: s.prompt, recommendedTool: s.recommendedTool })),
        });
      } catch {}
      return NextResponse.json({ solutions: fallback });
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
          const out = coerced.solutions.slice(0,3);
          try { await prisma.businessSolution.createMany({ data: out.map((s: any) => ({ companyUrl: url, department, task: s.task, solution: s.solution, prompt: s.prompt, recommendedTool: s.recommendedTool || "ChatGPT 4" })) }); } catch {}
          return NextResponse.json({ solutions: out });
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
          const out = regenParsed.solutions.slice(0,3);
          try { await prisma.businessSolution.createMany({ data: out.map((s: any) => ({ companyUrl: url, department, task: s.task, solution: s.solution, prompt: s.prompt, recommendedTool: s.recommendedTool || "ChatGPT 4" })) }); } catch {}
          return NextResponse.json({ solutions: out });
        }
      } catch (e) {
        console.error("Regen step failed", e);
      }

      console.error("Model returned JSON without solutions array:", JSON.stringify(parsed).slice(0, 500));
      const fallback = buildFallback();
      try { await prisma.businessSolution.createMany({ data: fallback.map((s: any) => ({ companyUrl: url, department, task: s.task, solution: s.solution, prompt: s.prompt, recommendedTool: s.recommendedTool })) }); } catch {}
      return NextResponse.json({ solutions: fallback });
    }

    // Clean helper
    const cleanStr = (s: string) => (s || "").replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim();

    const normalized = (list as any[]).slice(0, 3).map((it: any, idx: number) => {
      if (typeof it === 'string') {
        return {
          task: `Förslag ${idx+1}`,
          solution: cleanStr(it),
          prompt: `**ROLL & KONTEXT:**\nDu är ansvarig för ${department}.\n\n**UPPGIFT:**\n${cleanStr(it)}\n\n**INPUT – Fyll i detta:**\n[MÅL]: Vad vill du uppnå\n[KONTEXT]: Din nuvarande situation\n\n**OUTPUT-FORMAT:**\nLeverera:\n1) Analys\n2) Handlingsplan\n3) Förväntade resultat\n\n**EXEMPEL:**\nInput:\n[MÅL]: Effektivisera processer\n[KONTEXT]: 10 anställda, manuella rutiner\n\nOutput:\n1. Analys: Identifierade flaskhalsar\n2. Plan: Implementera automation\n3. Resultat: 30% tidsbesparing`,
          recommendedTool: "ChatGPT 4"
        };
      }
      return {
        task: cleanStr(it.task || it.title || it.name || `Förslag ${idx+1}`),
        solution: cleanStr(it.solution || it.summary || it.description || it.value || ""),
        prompt: cleanStr(it.prompt || it.instructions || it.guide || ""),
        recommendedTool: it.recommendedTool || "ChatGPT 4"
      };
    });

    // Persist to DB (BusinessSolution)
    try {
      if (normalized.length > 0) {
        await prisma.businessSolution.createMany({
          data: normalized.map((s: any) => ({
            companyUrl: url,
            department,
            task: s.task,
            solution: s.solution,
            prompt: s.prompt,
            recommendedTool: s.recommendedTool || null,
          })),
          skipDuplicates: false,
        });
      }
    } catch (dbErr) {
      console.error("BusinessSolution save error:", dbErr);
    }

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


