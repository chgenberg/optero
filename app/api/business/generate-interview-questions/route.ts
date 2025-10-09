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

    const systemPrompt = `Du är en expert AI-konsult som intervjuar ledningsgrupper för att förstå deras affärsproblem djupt. 

Din uppgift är att ställa riktade följdfrågor som hjälper dig förstå:
- Rotorsaken till problemet
- Nuvarande processer och system
- Involverade personer och avdelningar
- Tidigare försök att lösa problemet
- Affärspåverkan (tid, kostnad, kvalitet)
- Önskade resultat och framgångskriterier

Ställ EN specifik, öppen fråga i taget. Var professionell men personlig. Anpassa frågorna baserat på tidigare svar.

Efter 3-5 meningsfulla svar, sätt hasEnoughInfo: true.`;

    const userPrompt = contextInfo + conversationContext + `

Ställ nästa riktade följdfråga för att förstå problemet bättre. Var specifik och bygga på tidigare svar.

Returnera JSON i formatet:
{
  "question": "Din specifika följdfråga",
  "hasEnoughInfo": false
}

Om du har tillräckligt med information (efter 3-5 meningsfulla svar), sätt hasEnoughInfo: true och frågan kan vara en sammanfattning.`;

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

