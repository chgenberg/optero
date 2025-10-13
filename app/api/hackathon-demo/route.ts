import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { industry, challenge } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

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

    // Om ingen API-nyckel: returnera en minimal men giltig fallback så build/deploy inte bryts
    if (!apiKey) {
      return NextResponse.json({
        summary: { timeSaved: "[?]h/vecka", monthlyValue: "[?] kr", implementationTime: "2–4 veckor" },
        solutions: [],
        implementationPlan: [],
        nextSteps: []
      });
    }

    const openai = new OpenAI({ apiKey, timeout: 180000 });
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 4000,
    });
    const content = response.choices[0]?.message?.content || "";
    if (!content) throw new Error("Tomt AI-svar");
    let result: any;
    try {
      result = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : { summary: {}, solutions: [], implementationPlan: [], nextSteps: [] };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating hackathon demo:", error);
    return NextResponse.json(
      { error: "Kunde inte generera lösning" },
      { status: 500 }
    );
  }
}

