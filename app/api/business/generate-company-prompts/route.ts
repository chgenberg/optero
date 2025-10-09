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
  // Parse body first so we can use values in any fallback
  let body: any = null;
  try { body = await req.json(); } catch {}
  const url = body?.url;
  const department = body?.department;
  const content = body?.content;
  if (!url || !department || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {

    const site = (content || "").slice(0, 12000);
    // Attempt to include structured hints from scrape summary if present in content JSON
    let structuredHints = "";
    let headingsList: string[] = [];
    let titleStr = "";
    let descriptionStr = "";
    let companyName = "";
    let servicesLinks: string[] = [];
    let productsList: string[] = [];
    let servicesList: string[] = [];
    try {
      const maybeObj = JSON.parse(content);
      if (maybeObj && typeof maybeObj === 'object' && maybeObj.summary?.overview) {
        const ov = maybeObj.summary.overview;
        titleStr = ov.title || '';
        descriptionStr = ov.description || '';
        headingsList = Array.isArray(ov.headings) ? ov.headings.slice(0, 6) : [];
        companyName = ov.companyName || '';
        servicesLinks = Array.isArray(ov.servicesLinks) ? ov.servicesLinks.slice(0,5) : [];
        productsList = Array.isArray(ov.products) ? ov.products.slice(0,5) : [];
        servicesList = Array.isArray(ov.services) ? ov.services.slice(0,5) : [];
        structuredHints = `\nFÖRETAGSNAMN: ${ov.companyName || ''}\nUSPs: ${(ov.usps||[]).join(', ').slice(0,300)}\nKONTAKT: e-post ${(ov.contacts?.emails||[]).join(', ')}; tel ${(ov.contacts?.phones||[]).join(', ')}\nSOCIALA: ${(ov.socials||[]).slice(0,5).join(', ')}\nTJÄNSTLÄNKAR: ${(ov.servicesLinks||[]).slice(0,5).join(', ')}\nTEAM/Ledningssidor: ${(ov.likelyTeamPages||[]).slice(0,3).join(', ')}`;
      }
    } catch {}

    // Sector heuristic
    const lowerBlob = (titleStr + ' ' + descriptionStr).toLowerCase();
    const sector = /shop|cart|checkout|product|store/.test(lowerBlob) ? 'ecommerce'
      : /clinic|health|medical|patient/.test(lowerBlob) ? 'healthcare'
      : /saas|software|platform|api/.test(lowerBlob) ? 'saas'
      : /education|school|learning|course/.test(lowerBlob) ? 'education'
      : 'general';

    // Department × sector focus areas
    const focusByDept: Record<string, Record<string, string[]>> = {
      sales: {
        ecommerce: ["Abandoned cart recovery", "Cross/upsell sequencing", "CRM enrichment from orders"],
        saas: ["Lead scoring & PQL detection", "Demo follow-up automation", "CRM hygiene"],
        healthcare: ["Inbound triage to appointment", "Referral tracking", "Lead qualification"],
        education: ["Application nurturing", "Scholarship matching", "Alumni reactivation"],
        general: ["Lead qualification", "Meeting prep/notes", "Pipeline hygiene"]
      },
      marketing: {
        ecommerce: ["Product description variants", "UGC curation", "Email/SMS flows"],
        saas: ["Feature launch copy", "Case study drafting", "SEO briefs"],
        healthcare: ["Service page clarity", "FAQ drafting", "Local SEO"],
        education: ["Program page optimization", "Student stories", "Open day campaigns"],
        general: ["Content calendar", "Campaign briefs", "SEO outlines"]
      }
    } as any;
    const departmentKey = String(department || '').toLowerCase();
    const sectorLabelSv: Record<string,string> = {
      ecommerce: 'e‑handel',
      saas: 'SaaS',
      healthcare: 'vård',
      education: 'utbildning',
      general: 'verksamheten'
    };
    const focusAreas = (focusByDept[departmentKey]?.[sector]) || (focusByDept[departmentKey]?.general) || [];
    const systemPrompt = `Du är expert på AI-lösningar för ${department}-avdelningar. Du skapar praktiska, välstrukturerade prompts som sparar tid och ger tydliga resultat. Svara ENDAST med giltig JSON.`;
    
    const userPrompt = `Företag: ${url}
Avdelning: ${department}
Webbplats-info: ${site.slice(0, 1000)}
Strukturerad sammanfattning (om tillgänglig): ${structuredHints}

FOKUSOMRÅDEN (${department} × ${sector}): ${focusAreas.join('; ')}

MUST INCLUDE:
- Företagsnamn (om känt) i ROLL & KONTEXT
- Minst 2 termer från rubrikerna: ${headingsList.join(', ').slice(0, 200)}
- Minst 1 länk/term från tjänster/produkter om tillgängligt

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
        `**ROLL & KONTEXT:**\nDu arbetar på avdelningen ${department} på ${(titleStr && url) ? `${url} (${titleStr})` : url}. Referera minst 2 rubriker från: ${headingsList.slice(0,3).join('; ')}.\n\n**UPPGIFT:**\n${body}\n\n**INPUT - Fyll i detta:**\n[MÅL]: Vad vill ni uppnå\n[KÄLLA]: Länkar/dokument\n[FORMAT]: Hur ni vill ha resultatet\n\n**OUTPUT-FORMAT:**\n1) Sammanfattad analys\n2) Handlingslista\n3) Mätetal/uppföljning\n\n**EXEMPEL:**\nInput:\n[MÅL]: Snabbare process\n[KÄLLA]: Webbplats + interna dokument\n[FORMAT]: Checklista\n\nOutput:\n1. Analys...\n2. Åtgärder...\n3. KPI: tid/vecka, felgrad`
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

    // Post-process: enforce specificity and light sector adjustments
    const sectLabel = sectorLabelSv[sector] || 'verksamheten';
    const headingTerms = headingsList.slice(0, 3).filter(Boolean);
    const svcTerms = [...servicesLinks, ...productsList, ...servicesList].slice(0, 3).filter(Boolean);
    const ensureKpi = (s: string) => (/\b(min|h|tim|vecka|%|procent|KPI)\b/i.test(s) ? s : (s ? `${s} Tidsbesparing/KPI: uppskatta min/h per vecka.` : s));
    const containsAny = (txt: string, terms: string[]) => terms.some(t => txt.toLowerCase().includes(String(t).toLowerCase()));

    const adjusted = (normalized.length ? normalized : buildFallback()).map((s: any) => {
      let task = s.task || '';
      task = task.replace(/för\s+business/gi, `för ${sectLabel}`);
      let prompt = s.prompt || '';
      const mustCompany = companyName || url;
      const needHeadings = !containsAny(prompt, headingTerms);
      const needSvc = !containsAny(prompt, svcTerms);
      const needCompany = !containsAny(prompt, [companyName]) && !prompt.includes(url);
      const additions: string[] = [];
      if (needCompany) additions.push(`Företag: ${mustCompany}`);
      if (needHeadings && headingTerms.length) additions.push(`Rubriker att referera: ${headingTerms.join(' | ')}`);
      if (needSvc && svcTerms.length) additions.push(`Tjänst/produkt: ${svcTerms[0]}`);
      if (additions.length) {
        prompt = `${prompt}\n\n${additions.join('\n')}`.trim();
      }
      const solution = ensureKpi(s.solution || '');
      return { ...s, task, prompt, solution };
    });

    const finalOut = adjusted;

    // Persist to DB (BusinessSolution)
    try {
      if (finalOut.length > 0) {
        await prisma.businessSolution.createMany({
          data: finalOut.map((s: any) => ({
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

    return NextResponse.json({ solutions: finalOut });
  } catch (e: any) {
    console.error("Top-level catch in generate-company-prompts:", e);
    // Top-level fallback
    const { url, department } = (() => {
      try { return (e?.reqBody && JSON.parse(e.reqBody)) || {}; } catch { return {}; }
    })();
    const fallback = (() => {
      const dept = department || 'business';
      const site = url || 'företaget';
      const mk = (t: string, s: string) => ({
        task: t,
        solution: s,
        prompt: `**ROLL & KONTEXT:**\nDu arbetar på avdelningen ${dept} på ${site}.\n\n**UPPGIFT:**\n${s}\n\n**INPUT - Fyll i detta:**\n[MÅL]\n[KÄLLA]\n[FORMAT]\n\n**OUTPUT-FORMAT:**\n1) Analys\n2) Handlingslista\n3) KPI`,
        recommendedTool: 'ChatGPT 4',
      });
      return [
        mk(`AI-assisterad arbetsflödesanalys för ${dept}`, 'Analysera nuvarande arbetssätt och identifiera flaskhalsar.'),
        mk(`Automatiserad sammanställning av ${dept}-underlag`, 'Samla och strukturera underlag till handlingspunkter.'),
        mk(`Standardiserade mallar och checklistor för ${dept}`, 'AI-drivna mallar som påskyndar leverans och höjer kvalitet.'),
      ];
    })();
    return NextResponse.json({ solutions: fallback });
  }
}


