import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 1,
      timeout: 120000 // 2 minutes for question generation
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, tasks, experience, challenges } = await request.json();

    if (!openai) {
      // Return default questions if no API key
      return NextResponse.json({
        questions: getDefaultQuestions(profession, specialization),
      });
    }

    const role = specialization || profession;
    const taskList = tasks?.map((t: any) => t.task || t.name).filter(Boolean).join(", ") || "allmänna arbetsuppgifter";

    const prompt = `Du är en expert på att förstå arbetsprocesser och identifiera var AI kan göra störst nytta.

Skapa 15-20 djupgående, BRANSCHSPECIFIKA frågor för att förstå en ${role}s dagliga arbete och utmaningar.

Kontext:
- Yrke: ${profession}
- Specialisering: ${specialization || "Generell"}
- Valda uppgifter: ${taskList}
${experience ? `- Erfarenhet: ${experience}` : ""}
${challenges?.length > 0 ? `- Utmaningar: ${challenges.join(", ")}` : ""}

VIKTIGT - Anpassa frågorna till yrket:
- För LÄRARE: Fråga om elever, lektionsplanering, bedömning, föräldrakontakt
- För SÄLJARE: Fråga om leads, CRM, kundmöten, offerter, uppföljning
- För EKONOM: Fråga om bokföring, rapporter, avstämningar, budgetar
- För SJUKSKÖTERSKA: Fråga om patienter, journalföring, medicinering, vårdplanering
- För PROJEKTLEDARE: Fråga om projektplan, resurser, stakeholders, leveranser
- Etc. - använd RÄTT terminologi för varje yrke!

UNDVIK generiska frågor som:
❌ "Hur mycket tid spenderar du på kundinteraktioner?" (för en lärare)
❌ "Hur hanterar du försäljningsprocessen?" (för en ekonom)
✅ Använd istället yrkesspecifika termer och situationer

Skapa frågor som:
1. Kartlägger EXAKT vad personen gör varje dag (med rätt terminologi)
2. Identifierar tidstjuvar och ineffektiviteter (specifika för yrket)
3. Förstår nuvarande verktyg och arbetssätt (branschspecifika system)
4. Avslöjar dolda möjligheter för AI-automatisering (relevanta för yrket)
5. Fångar branschspecifika utmaningar (unika för denna profession)

Kategorisera frågorna i:
- Dagliga rutiner (4-5 frågor) - använd yrkesspecifika exempel
- Tidskrävande uppgifter (3-4 frågor) - fokusera på typiska uppgifter för yrket
- Verktyg & system (3-4 frågor) - nämn relevanta branschsystem
- Kommunikation & samarbete (3-4 frågor) - anpassa till yrkeskontexten
- Branschspecifika utmaningar (2-3 frågor) - djupdyk i yrkesspecifika problem

Format som JSON:
{
  "categories": [
    {
      "name": "Kategorinamn",
      "questions": [
        {
          "id": "q1",
          "question": "Frågan här?",
          "type": "text|multiselect|scale",
          "options": ["Om multiselect, lista alternativ"],
          "followUp": "Följdfråga om svaret är X"
        }
      ]
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return NextResponse.json(parsed);
      }
    } catch (aiError) {
      console.error("AI question generation failed:", aiError);
    }

    // Fallback to default questions
    return NextResponse.json({
      questions: getDefaultQuestions(profession, specialization),
    });
  } catch (error) {
    console.error("Error preparing questions:", error);
    return NextResponse.json({
      questions: getDefaultQuestions("", ""),
    });
  }
}

function getDefaultQuestions(profession: string, specialization: string) {
  const role = specialization || profession || "yrkesutövare";
  
  return {
    categories: [
      {
        name: "Dagliga rutiner",
        questions: [
          {
            id: "daily1",
            question: `Beskriv en typisk arbetsdag som ${role}. Vad gör du från morgon till kväll?`,
            type: "text",
          },
          {
            id: "daily2",
            question: "Vilka uppgifter tar mest tid under en vanlig vecka?",
            type: "text",
          },
          {
            id: "daily3",
            question: "Hur mycket tid lägger du på administration vs kärnverksamhet?",
            type: "scale",
            options: ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"],
          },
        ],
      },
      {
        name: "Tidskrävande uppgifter",
        questions: [
          {
            id: "time1",
            question: "Vilka återkommande uppgifter känns mest repetitiva eller tråkiga?",
            type: "text",
          },
          {
            id: "time2",
            question: "Vad skulle du vilja slippa göra helt om du kunde?",
            type: "text",
          },
          {
            id: "time3",
            question: "Hur ofta behöver du göra om samma arbete på grund av fel eller ändringar?",
            type: "multiselect",
            options: ["Dagligen", "Veckovis", "Månadsvis", "Sällan", "Aldrig"],
          },
        ],
      },
      {
        name: "Verktyg & system",
        questions: [
          {
            id: "tools1",
            question: "Vilka digitala verktyg och system använder du dagligen?",
            type: "text",
          },
          {
            id: "tools2",
            question: "Vad fungerar dåligt med dina nuvarande verktyg?",
            type: "text",
          },
          {
            id: "tools3",
            question: "Har du testat några AI-verktyg redan? Vilka och hur gick det?",
            type: "text",
          },
        ],
      },
      {
        name: "Kommunikation & samarbete",
        questions: [
          {
            id: "comm1",
            question: "Hur mycket tid lägger du på möten, mail och annan kommunikation per dag?",
            type: "scale",
            options: ["0-1h", "1-2h", "2-4h", "4-6h", "6h+"],
          },
          {
            id: "comm2",
            question: "Vilka typer av dokument och rapporter skapar du regelbundet?",
            type: "text",
          },
          {
            id: "comm3",
            question: "Hur delar du information och samarbetar med kollegor?",
            type: "text",
          },
        ],
      },
      {
        name: "Branschspecifika utmaningar",
        questions: [
          {
            id: "industry1",
            question: `Vad är de största utmaningarna inom ${profession || "ditt yrke"} just nu?`,
            type: "text",
          },
          {
            id: "industry2",
            question: "Vilka förändringar ser du komma i din bransch de närmaste åren?",
            type: "text",
          },
        ],
      },
    ],
  };
}
