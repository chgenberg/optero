import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { industry, challenge } = await request.json();

    const prompt = `Du är en AI-expert och business consultant. Skapa en komplett AI-lösning för detta hackathon-scenario:

BRANSCH: ${industry}

UTMANING:
${challenge}

SKAPA EN KOMPLETT ANALYS OCH LÖSNING:

Svara med JSON i detta EXAKTA format:

{
  "summary": {
    "timeSaved": "[X-Y]h/vecka",
    "monthlyValue": "[BELOPP] kr",
    "implementationTime": "[TIDSPERIOD]"
  },
  "solutions": [
    {
      "name": "Verktygsnamn",
      "description": "Kort beskrivning av vad det gör och hur det löser problemet (2-3 meningar)",
      "timeSaved": "X-Y h/vecka",
      "cost": "Pris/månad",
      "difficulty": "Lätt/Medel/Avancerad",
      "quickStart": "En konkret prompt eller första steg att testa direkt"
    }
  ],
  "implementationPlan": [
    {
      "title": "Vecka 1: [Rubrik]",
      "tasks": [
        "Konkret task 1",
        "Konkret task 2",
        "Konkret task 3"
      ]
    },
    {
      "title": "Vecka 2: [Rubrik]",
      "tasks": [...]
    },
    {
      "title": "Vecka 3: [Rubrik]",
      "tasks": [...]
    },
    {
      "title": "Vecka 4: [Rubrik]",
      "tasks": [...]
    }
  ],
  "nextSteps": [
    "Konkret nästa steg 1",
    "Konkret nästa steg 2",
    "Konkret nästa steg 3",
    "Konkret nästa steg 4",
    "Konkret nästa steg 5"
  ]
}

VIKTIGT:
- GE EXAKT 3 AI-lösningar
- Varje lösning ska vara KONKRET och TESTBAR direkt
- Tidsbesparing och värde ska vara REALISTISKT
- Implementation plan ska vara ACTIONABLE
- quickStart ska vara något de kan copy-paste och testa NU
- Fokusera på VERKLIGA verktyg (ChatGPT, Claude, Notion AI, Make, Zapier, etc.)
- Var specifik för just denna bransch och utmaning

Gör lösningen så värdefull och konkret som möjligt!`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Du är en expert på AI-verktyg för business. Du skapar konkreta, implementerbara lösningar. Svara ENDAST med valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating hackathon demo:", error);
    return NextResponse.json(
      { error: "Kunde inte generera lösning" },
      { status: 500 }
    );
  }
}

