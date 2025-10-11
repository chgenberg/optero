import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 1,
  timeout: 60000
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
- Börja brett, bli gradvis mer specifik
- Be om konkreta exempel när de är vaga
- Utmana antaganden respektfullt
- Gräv djupare i intressanta spår

Efter 3-5 SUBSTANTIELLA svar med konkret information, sätt hasEnoughInfo: true.`;

    const userPrompt = contextInfo + conversationContext + `

Analysera konversationen och ställ nästa SMART följdfråga. Fokusera på att få fram:
- Konkreta siffror och mätetal
- Specifika exempel och situationer
- Tydliga orsak-verkan samband
- Mätbara målbilder

Din fråga ska vara:
1. Direkt och lätt att svara på
2. Bygga vidare på tidigare svar
3. Avslöja ny, värdefull information
4. Leda mot konkreta lösningar

Returnera JSON:
{
  "question": "Din specifika, insiktsfulla följdfråga",
  "hasEnoughInfo": false
}

När du har 3-5 SUBSTANTIELLA svar med konkret info (siffror, exempel, detaljer), sätt hasEnoughInfo: true.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500
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

    return NextResponse.json({
      question: result.question || "Berätta mer om detta problem.",
      hasEnoughInfo: result.hasEnoughInfo || conversationHistory.length >= 5
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

