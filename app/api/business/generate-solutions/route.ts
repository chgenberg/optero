import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { DEPARTMENT_QUESTIONS } from "@/data/business-questions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  maxRetries: 1,
  timeout: 180000 // 3 minutes for thorough B2B analysis
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const systemPrompt = `Du är en senior AI-konsult med expertis inom ${data.dept} och ${data.industry}.
    
    Din uppgift är att analysera företagets svar och skapa 5 MYCKET SPECIFIKA AI-lösningar som:
    
    1. LÖSER VERKLIGA PROBLEM de beskrivit i sina svar
    2. ÄR ANPASSADE till deras bransch (${data.industry}) och avdelning (${data.dept})
    3. TAR HÄNSYN till deras nuvarande verktyg och processer
    4. KAN IMPLEMENTERAS inom 2-4 veckor
    5. GER MÄTBAR tidsbesparing och ROI
    6. ANVÄNDER specifika, namngivna AI-verktyg (inte generiska)
    
    VIKTIGT:
    - Referera till deras specifika svar (t.ex. "Eftersom ni använder Salesforce...")
    - Beräkna ROI baserat på deras faktiska siffror
    - Ge konkreta verktygsnamn med priser
    - Inkludera detaljerad 4-veckors implementeringsplan
    - Var EXTREMT specifik - inte generiska råd
    
    Tänk som en konsult som fakturerar 5,000 SEK/timme - ge premium-kvalitet!`;

    // Format answers with question context for better analysis
    const formattedAnswers = Object.entries(data.answers).map(([index, answer]) => {
      const questionIndex = parseInt(index);
      const questions = DEPARTMENT_QUESTIONS[data.dept] || [];
      const question = questions[questionIndex];
      return `Q: ${question?.question || `Fråga ${questionIndex + 1}`}\nA: ${answer}`;
    }).join('\n\n');

    const userPrompt = `
FÖRETAGSKONTEXT:
- Avdelning: ${data.dept}
- Företagsstorlek: ${data.size}
- Bransch: ${data.industry}

DERAS SVAR PÅ FRÅGORNA:
${formattedAnswers}

ANALYS-UPPGIFT:
Baserat på deras specifika svar, skapa 5 AI-lösningar som är EXAKT anpassade för deras situation.

EXEMPEL PÅ SPECIFICITET:
- Om de sa "50 fakturor/månad" → beräkna ROI baserat på 50 fakturor
- Om de sa "använder Salesforce" → föreslå Salesforce Einstein eller Einstein GPT
- Om de sa "3 timmar på offerter" → visa hur AI reducerar till 15 minuter
- Om de sa "ingen systematisk uppföljning" → fokusera på automatisering

RETURNERA JSON:
{
  "solutions": [
    {
      "title": "Actionable titel (max 60 tecken)",
      "problem": "Exakt problem från deras svar (2-3 meningar)",
      "solution": "Detaljerad lösning (4-5 meningar) - hur AI löser detta SPECIFIKT för dem",
      "benefits": [
        "Konkret fördel 1 med siffror",
        "Konkret fördel 2 med siffror",
        "Konkret fördel 3 med siffror",
        "Konkret fördel 4 med siffror"
      ],
      "tools": [
        {
          "name": "Exakt verktygsnamn",
          "description": "Vad det gör för just deras use case",
          "price": "från X SEK/månad eller Custom pricing"
        }
      ],
      "implementation": {
        "week1": "Konkreta steg vecka 1",
        "week2": "Konkreta steg vecka 2",
        "week3": "Konkreta steg vecka 3",
        "week4": "Konkreta steg vecka 4"
      },
      "timeSaved": "X-Y timmar/vecka för teamet",
      "roi": "X,000 - Y,000 SEK/år"
    }
  ],
  "totalTimeSaved": "XX-YY timmar per vecka",
  "totalROI": "XXX,000 - YYY,000 SEK/år"
}

KVALITETSKRAV:
- Varje lösning måste referera till minst 1 specifikt svar de gav
- ROI måste vara beräknat baserat på deras faktiska siffror
- Verktyg måste vara riktiga, namngivna produkter
- Implementation måste vara konkret och actionable`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5", // Using GPT-5 for highest quality B2B analysis
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 16000,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate solutions error:", error);
    return NextResponse.json(
      { error: "Failed to generate solutions" },
      { status: 500 }
    );
  }
}
