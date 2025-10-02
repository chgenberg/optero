import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, experience, challenges, tasks } = await request.json();

    if (!profession || !specialization) {
      return NextResponse.json(
        { error: "Saknar nödvändig information" },
        { status: 400 }
      );
    }

    const safeChallenges: string[] = Array.isArray(challenges) ? challenges : [];
    const safeTasks: { task: string; priority: number }[] = Array.isArray(tasks) ? tasks : [];

    const prioritizedTasks = safeTasks
      .sort((a, b) => (b?.priority ?? 0) - (a?.priority ?? 0))
      .map((t) => `${t.task} (prioritet: ${t.priority === 5 ? 'HÖG' : t.priority === 3 ? 'MEDEL' : t.priority === 1 ? 'LÅG' : 'OKÄND'})`);

    const prompt = `Du är en expert på AI-verktyg och hur de kan användas i svenska yrken.

Användarprofil:
- Yrke: ${profession}
- Specialisering: ${specialization}
${experience ? `- Erfarenhetsnivå: ${experience}` : ''}
${safeChallenges.length > 0 ? `- Största utmaningar: ${safeChallenges.join(", ")}` : ''}
${prioritizedTasks.length > 0 ? `- Arbetsuppgifter (sorterade efter tid/prioritet):\n${prioritizedTasks.map((task) => `  * ${task}`).join('\n')}` : ''}

UPPDRAG:
Skapa en djupgående, värdefull analys för denna yrkesperson i Sverige.

Steg 1 – VERKLIGA SCENARION: Skapa EXAKT 3 realistiska, konkreta situationer från vardagen i detta yrke som kan lösas med AI. För varje scenario:
- title: Kort, slagkraftig rubrik
- situation: Detaljerad beskrivning av den verkliga utmaningen/situationen (2-3 meningar)
- solution: Utförlig beskrivning av hur AI löser detta (3-4 meningar, var specifik!)
- tools: Array med 2-3 verktygsnamn som kan användas

Steg 2 – INFERERA UPPGIFTER: Om inga uppgifter angivits, lista 6–10 vanliga arbetsuppgifter för denna roll i Sverige.

Steg 3 – REKOMMENDERA VERKTYG: Ge EXAKT 5 konkreta AI-verktyg. Var UTFÖRLIG och SPECIFIK:
1) name – Verktygets namn
2) description – Beskrivning (2-3 meningar, förklara VAD det gör)
3) useCase – Detaljerad användning för denna roll (3-4 meningar med konkreta exempel)
4) timeSaved – Realistisk tidsbesparing
5) difficulty – Lätt/Medel/Avancerad
6) link – Verklig länk
7) tips – Array med 4-6 MYCKET konkreta, hands-on tips (t.ex. exakta prompts att använda, specifika integrationer, steg-för-steg guides)

Svara ENDAST med giltig JSON:
{
  "scenarios": [
    {
      "title": "...",
      "situation": "...",
      "solution": "...",
      "tools": ["...", "..."]
    }
  ],
  "inferredTasks": ["..."],
  "recommendations": [
    {
      "name": "...",
      "description": "...",
      "useCase": "...",
      "timeSaved": "...",
      "difficulty": "Lätt/Medel/Avancerad",
      "link": "https://...",
      "tips": ["...", "...", "..."]
    }
  ]
}

Prioritera verktyg som:
- ChatGPT/Claude för dokumentation och kommunikation
- Branschspecifika AI-verktyg
- Automationsverktyg (Zapier, Make)
- Transkriptionsverktyg (Whisper, Otter.ai)
- Röststyrda assistenter för snabb dokumentation

Sortera rekommendationerna efter störst potentiell påverkan.`;

    let result: any = { scenarios: [], inferredTasks: [], recommendations: [] };

    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await openai.responses.create({
          model: "gpt-5",
          input: prompt,
        });
        const content = typeof (response as any).output_text === "string" ? (response as any).output_text : "";
        if (content) {
          let parsed: any = null;
          try {
            parsed = JSON.parse(content);
          } catch {
            const match = content.match(/\{[\s\S]*\}/);
            if (match) parsed = JSON.parse(match[0]);
          }

          if (parsed && typeof parsed === "object") {
            result.scenarios = Array.isArray(parsed.scenarios) ? parsed.scenarios : [];
            result.inferredTasks = Array.isArray(parsed.inferredTasks) ? parsed.inferredTasks : [];
            result.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
          }
        }
      } catch (aiErr) {
        console.warn("AI recommendations failed, using fallback", aiErr);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json({ scenarios: [], inferredTasks: [], recommendations: [] });
  }
}

