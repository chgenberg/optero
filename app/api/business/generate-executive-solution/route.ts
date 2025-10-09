import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2,
  timeout: 180000 // 3 minutes for GPT-5
});

export const maxDuration = 180; // 3 minutes

export async function POST(req: NextRequest) {
  try {
    const { url, websiteContent, websiteSummary, documentsContent, problems, conversations } = await req.json();

    if (!problems || problems.length === 0) {
      return NextResponse.json({ error: "No problems provided" }, { status: 400 });
    }

    const solutions = [];

    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const conversation = conversations[i]?.conversation || [];

      const systemPrompt = `Du är en senior AI-konsult med expertis inom affärsprocesser, automation och AI-implementation. 

Din uppgift är att analysera företagsproblem djupt och rekommendera den BÄSTA lösningen:
1. **AI-Prompt**: En färdig, avancerad prompt som löser problemet direkt (för enkla till medelkomplexa problem)
2. **Bot-implementation**: Detaljerade instruktioner för att bygga en specialiserad AI-bot (för komplexa, återkommande problem)

Basera ditt val på:
- Problemets komplexitet
- Frekvens (engångsproblem vs återkommande)
- Behov av integration med andra system
- Kostnadseffektivitet

Returnera alltid konkreta, implementerbara lösningar.`;

      const userPrompt = `
FÖRETAG: ${url}

FÖRETAGSINFORMATION:
${websiteSummary?.mainText?.slice(0, 3000) || websiteContent?.slice(0, 3000) || ""}

DOKUMENT OCH DATA:
${documentsContent?.slice(0, 5000) || "Inga dokument uppladdade"}

PROBLEM:
${problem}

DETALJERAD INTERVJU:
${conversation.map((m: any) => `${m.role === 'user' ? 'Kund' : 'AI'}: ${m.content}`).join('\n')}

UPPGIFT:
Analysera detta problem djupt och bestäm den bästa lösningsmetoden.

Returnera JSON i EXAKT detta format:
{
  "problem": "${problem}",
  "analysis": "Djupgående analys av problemet, rotorsak, och affärspåverkan (3-5 meningar)",
  "approach": "prompt" eller "bot",
  "prompt": "Om approach är 'prompt': En MYCKET DETALJERAD, KOMPLETT prompt som löser hela problemet. Inkludera ROLL, KONTEXT, UPPGIFT, INPUT, OUTPUT, EXEMPEL. Minst 500 ord.",
  "botInstructions": {
    "overview": "Om approach är 'bot': Översikt av vad boten ska göra",
    "technicalStack": ["Lista med teknologier, t.ex. 'Python', 'OpenAI API', 'PostgreSQL'"],
    "implementation": ["Steg 1 beskrivning", "Steg 2 beskrivning", "...minst 5-8 steg"],
    "cost": "Uppskattad total kostnad (utveckling + drift/månad)",
    "timeline": "Uppskattad implementationstid"
  },
  "expectedOutcomes": ["Konkret resultat 1", "Konkret resultat 2", "...minst 3-5 resultat med siffror om möjligt"]
}

VIKTIGT:
- Om problemet kan lösas med en prompt: Gör en MYCKET GEDIGEN prompt (minst 500 ord)
- Om problemet kräver en bot: Ge DETALJERADE implementationssteg
- Var konkret med siffror: kostnader, tidsbesparingar, ROI
- Basera rekommendationer på företagets FAKTISKA kontext`;

      try {
        console.log(`Generating solution for problem ${i + 1}/${problems.length}`);
        
        const completion = await openai.chat.completions.create({
          model: "gpt-5-mini", // Using gpt-5-mini for proven reliability
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 4000
        });

        const content = completion.choices[0].message.content || "{}";
        const solution = JSON.parse(content);

        // Ensure the solution has the correct structure
        solutions.push({
          problem: solution.problem || problem,
          analysis: solution.analysis || "Djupgående analys krävs för detta problem.",
          approach: solution.approach || "prompt",
          prompt: solution.approach === "prompt" ? solution.prompt : undefined,
          botInstructions: solution.approach === "bot" ? solution.botInstructions : undefined,
          expectedOutcomes: solution.expectedOutcomes || ["Förbättrad effektivitet", "Minskade kostnader", "Bättre kvalitet"]
        });

      } catch (error) {
        console.error(`Error generating solution for problem ${i + 1}:`, error);
        // Fallback solution
        solutions.push({
          problem,
          analysis: `Detta är ett komplext problem som kräver noggrann analys. Baserat på intervjun identifierar vi flera kritiska faktorer som påverkar er verksamhet.`,
          approach: "prompt",
          prompt: `**ROLL & KONTEXT:**
Du är en expert inom ${url} och ska hjälpa till att lösa följande problem: ${problem}

**UPPGIFT:**
Analysera situationen och ge konkreta rekommendationer.

**INPUT - Fyll i detta:**
[NULÄGE]: Beskriv er nuvarande situation
[MÅL]: Vad vill ni uppnå
[RESURSER]: Vilka resurser har ni tillgängliga

**OUTPUT-FORMAT:**
Leverera:
1) Situationsanalys
2) Rekommenderade åtgärder
3) Implementationsplan
4) Förväntade resultat

**EXEMPEL:**
Input:
[NULÄGE]: Vi har manuella processer
[MÅL]: Automatisera 50%
[RESURSER]: 2 utvecklare, 3 månader

Output:
1. Analys: Identifierade 5 automatiseringsbara processer
2. Åtgärder: Implementera RPA för process A, B, C
3. Plan: Fas 1 (månad 1-2), Fas 2 (månad 3)
4. Resultat: 60% tidsbesparing, ROI på 8 månader`,
          expectedOutcomes: [
            "Förbättrad processeffektivitet",
            "Minskad manuell arbetsbelastning",
            "Bättre datakvalitet och insikter"
          ]
        });
      }
    }

    return NextResponse.json({ solutions });

  } catch (error: any) {
    console.error("Executive solution generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate solutions",
        details: error.message
      },
      { status: 500 }
    );
  }
}

