import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Global sessions map
declare global {
  var interviewSessions: Map<string, any>;
}

if (!global.interviewSessions) {
  global.interviewSessions = new Map();
}

const interviewSessions = global.interviewSessions;

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, userContext } = await request.json();

    // Skapa unikt session-ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Bygg kontext för intervjun
    const context = `
Du är en erfaren AI-konsult som genomför en djupgående intervju med en ${profession} (${specialization}).

ANVÄNDARKONTEXT:
- Arbetsuppgifter: ${userContext.tasks?.map((t: any) => t.task).join(", ") || "Okänt"}
- Utmaningar: ${userContext.challenges?.join(", ") || "Okänt"}
- Erfarenhetsnivå: ${userContext.experience || "Okänt"}

DIN UPPGIFT:
Genomför en conversational intervju med 10-12 frågor för att förstå EXAKT hur deras arbetsvardag ser ut.

MÅL: Samla in SÅ MYCKET KONKRET INFORMATION som möjligt för att kunna ge hyperpersonaliserade AI-rekommendationer.

VIKTIGA OMRÅDEN ATT TÄCKA:
1. Typisk arbetsdag - be om en KONKRET tidslinje (t.ex. "Vad gör du mellan 8-9, 9-10, etc?")
2. Tidsslukare - fråga om EXAKTA siffror (t.ex. "Hur många timmar/dag går till dokumentation?")
3. Nuvarande verktyg - vilka SPECIFIKA system/program använder de?
4. Teknisk nivå - få ett TYDLIGT nummer 1-10
5. Repetitiva uppgifter - vilka saker gör de VARJE dag/vecka?
6. Frustration - vad är MEST irriterande i jobbet?
7. Mål - vad vill de UPPNÅ med AI? (tid/kvalitet/mindre stress)
8. Budget - KONKRET summa i kronor/månad
9. Inlärningstid - hur många timmar/vecka kan de lägga på att lära sig?
10. Samarbete - arbetar de ensam eller i team? Hur?

REGLER:
- Ställ EN kort, SPECIFIK fråga i taget
- Be om KONKRETA exempel och SIFFROR
- Om de svarar vagt: be om förtydligande
- Var personlig, empatisk och nyfiken
- Endast frågan, inga förklaringar
- Svensk

FÖRSTA FRÅGAN: Börja med att be dem beskriva en TYPISK arbetsdag från morgon till kväll. Be om konkreta tider och vad de gör.

Ställ frågan nu:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Du är en erfaren AI-konsult som genomför djupintervjuer. Ställ endast EN fråga i taget, kort och koncist. Endast frågan, inga andra kommentarer.",
        },
        { role: "user", content: context },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const firstQuestion = completion.choices[0].message.content || "Kan du berätta om en typisk arbetsdag för dig?";

    // Spara session
    interviewSessions.set(sessionId, {
      profession,
      specialization,
      userContext,
      messages: [
        { role: "system", content: context },
        { role: "assistant", content: firstQuestion },
      ],
      startedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      sessionId,
      firstQuestion,
    });
  } catch (error) {
    console.error("Error starting premium interview:", error);
    return NextResponse.json(
      { error: "Kunde inte starta intervjun" },
      { status: 500 }
    );
  }
}

