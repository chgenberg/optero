import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const systemPrompt = `Du är en AI-expert som hjälper företag att implementera AI-lösningar.
    Baserat på företagets svar, skapa 5 KONKRETA användningsfall som:
    - Löser verkliga problem de har
    - Kan implementeras direkt
    - Ger mätbar tidsbesparing
    - Har tydlig ROI
    - Använder befintliga AI-verktyg
    
    Fokusera på PRAKTISKA lösningar, inte teoretiska.
    Varje lösning ska vara så specifik att de kan börja imorgon.`;

    const userPrompt = `
    Företagsinformation:
    - Avdelning: ${data.dept}
    - Storlek: ${data.size}
    - Bransch: ${data.industry}
    
    Svar på frågor:
    ${JSON.stringify(data.answers, null, 2)}
    
    Skapa 5 konkreta AI-lösningar för detta team.
    
    Returnera som JSON med denna struktur:
    {
      "solutions": [
        {
          "title": "Kort, actionable titel",
          "problem": "Specifikt problem de har (baserat på deras svar)",
          "solution": "Detaljerad lösning med AI (hur det fungerar i praktiken)",
          "tools": ["Verktyg 1", "Verktyg 2", "Verktyg 3"],
          "timeSaved": "X-Y timmar per vecka",
          "implementation": "Steg-för-steg hur de implementerar (2-4 veckor)",
          "roi": "Konkret ROI-beräkning i SEK per år"
        }
      ],
      "totalTimeSaved": "Total tid sparad för hela teamet per vecka",
      "totalROI": "Total ROI per år i SEK"
    }
    
    GÖR LÖSNINGARNA MYCKET SPECIFIKA baserat på deras svar!
    Om de t.ex. sa att de använder Salesforce, föreslå Salesforce Einstein.
    Om de sa att de skickar 100 emails/vecka, beräkna ROI baserat på det.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
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
