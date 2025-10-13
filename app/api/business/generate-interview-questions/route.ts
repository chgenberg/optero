import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 1,
  timeout: 180000
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { problem, websiteContext, documentsContext, conversationHistory } = await req.json();

    if (!problem) {
      return NextResponse.json({ error: "Problem is required" }, { status: 400 });
    }

    const contextInfo = `
FÖRETAGSINFORMATION:
${websiteContext}

DOKUMENT OCH DATA:
${documentsContext}

PROBLEMFORMULERING:
${problem}
`;

    const conversationContext = conversationHistory.length > 0
      ? `\n\nTIDIGARE KONVERSATION:\n${conversationHistory.map((m: any) => `${m.role === 'user' ? 'Användare' : 'AI'}: ${m.content}`).join('\n')}`
      : '';

    const systemPrompt = `Du är en senior AI-konsult som intervjuar företagsledare för att förstå deras affärsproblem på djupet. Du har 20+ års erfarenhet av företagstransformation.

Din uppgift är att ställa SMARTA, INSIKTSFULLA följdfrågor som avslöjar:

1. DJUPARE ORSAKER:
- Vad som verkligen ligger bakom symptomen
- Dolda beroenden och systemfaktorer
- Kulturella eller organisatoriska hinder

2. KONKRET PÅVERKAN:
- Exakta tids-/kostnadsförluster (be om siffror)
- Vilka KPI:er som påverkas mest
- Hur det påverkar kunder/medarbetare

3. TIDIGARE FÖRSÖK:
- Vad har testats och varför misslyckades det
- Vilka resurser som redan investerats
- Lärdomar från tidigare initiativ

4. FRAMTIDSBILD:
- Hur skulle "perfekt" se ut
- Mätbara framgångskriterier
- Tidshorisonter och milstolpar

INTERVJUTEKNIK:
- Alltid specifik: förbjudna generiska fraser ("Berätta mer", "Kan du utveckla", "Vad menar ni?").
- Referera problemet och företagskontexten explicit.
- Inkludera 2–3 konkreta delpunkter i samma fråga (t.ex. tidsram, siffra, system/steg).
- Be om siffror (%, antal, veckor) och exempel.
- Börja bredare första frågan, sedan mer specifikt per svar.

Efter 3-5 SUBSTANTIELLA svar med konkret information, sätt hasEnoughInfo: true.`;

    const userPrompt = contextInfo + conversationContext + `

Ställ EN tydligt riktad följdfråga med 2–3 konkreta delpunkter (max 2 meningar + ev. punktlista). Krav:
- Referera explicit till PROBLEMFORMULERINGEN (avdelning/område/ämne) eller tidigare svar.
- Be om en siffra/tidsram/exempel och nämn system eller processsteg om relevant.
- Undvik generiska uttryck ("Berätta mer", "Kan du utveckla").

Returnera JSON:
{
  "question": "Din specifika följdfråga (på svenska)",
  "hasEnoughInfo": false
}

När du har 3–5 substantiella svar, sätt hasEnoughInfo: true.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_completion_tokens: 800
    });

    const content = completion.choices[0].message.content || "{}";
    let result;
    
    try {
      result = JSON.parse(content);
    } catch (e) {
      result = {
        question: "Kan du berätta mer om hur detta problem påverkar er verksamhet dagligen?",
        hasEnoughInfo: false
      };
    }

    // Server-side refinement to prevent generic fallbacks
    const genericPatterns = /(berätta mer|kan du utveckla|berätta gärna|mer info)/i;
    const pickDimension = (i: number) => {
      const dims = [
        "tidsram (veckor/månader)",
        "mätetal/KPI (t.ex. %, antal, kostnad/vecka)",
        "system/verktyg i processen",
        "roller/intressenter",
        "nuvarande steg (1–3 steg) och var det brister"
      ];
      return dims[i % dims.length];
    };
    let q = (result.question || "").trim();
    if (!q || genericPatterns.test(q)) {
      const step = conversationHistory.length || 0;
      const dim = pickDimension(step);
      const shortProblem = problem.slice(0, 160);
      q = `För problemet: "${shortProblem}" – kan du specificera ${dim}? Lägg till en konkret siffra/tidsram och ett exempel.`;
    }

    return NextResponse.json({
      question: q,
      hasEnoughInfo: Boolean(result.hasEnoughInfo) || conversationHistory.length >= 5
    });

  } catch (error: any) {
    console.error("Interview question generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate question",
        question: "Kan du utveckla mer kring detta problem?",
        hasEnoughInfo: false
      },
      { status: 500 }
    );
  }
}

