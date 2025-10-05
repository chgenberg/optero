import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  maxRetries: 1,
  timeout: 180000 // 3 minutes for premium analysis
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const systemPrompt = `Du är en AI-expert som skapar djupgående analyser för yrkesverksamma.
    Baserat på användarens svar, skapa en komplett guide med:
    - Detaljerade utmaningar och lösningar
    - Minst 10-15 AI-verktyg med konkreta användningsfall
    - 4-veckors implementeringsplan
    - ROI-beräkning
    - Konkreta exempel och tips
    
    Svara på svenska och var mycket detaljerad och specifik.`;

    const userPrompt = `
    Yrke: ${data.profession}
    Specialisering: ${data.specialization}
    Uppgifter: ${JSON.stringify(data.tasks)}
    Intervjusvar: ${JSON.stringify(data.answers || data.interviewAnswers)}
    
    Skapa en komplett premium-analys med alla delar som beskrivs i systempromten.
    Returnera som JSON med denna struktur:
    {
      "profession": "...",
      "specialization": "...",
      "totalTimeSaved": "15-20",
      "roi": "300",
      "challengeSolutions": [
        {
          "challenge": "...",
          "solution": "...",
          "tools": ["Tool1", "Tool2"]
        }
      ],
      "tools": [
        {
          "name": "...",
          "description": "...",
          "timeSaved": "2-3h/vecka",
          "howToUse": "...",
          "examples": ["...", "..."],
          "tips": "...",
          "link": "https://..."
        }
      ],
      "implementationPlan": [
        {
          "focus": "...",
          "tasks": ["...", "..."]
        }
      ]
    }`;

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
    console.error("Generate results error:", error);
    return NextResponse.json(
      { error: "Failed to generate results" },
      { status: 500 }
    );
  }
}