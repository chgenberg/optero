import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Importera sessions från start route (i produktion: använd databas)
// Temporär lösning: skapa en global Map
declare global {
  var interviewSessions: Map<string, any>;
}

if (!global.interviewSessions) {
  global.interviewSessions = new Map();
}

const interviewSessions = global.interviewSessions;

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userAnswer, questionNumber } = await request.json();

    // Hämta session
    const session = interviewSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session hittades inte" },
        { status: 404 }
      );
    }

    // Lägg till användarens svar
    session.messages.push({
      role: "user",
      content: userAnswer,
    });

    const totalQuestions = 12;
    const isLastQuestion = questionNumber >= totalQuestions - 1;

    if (isLastQuestion) {
      // Sista frågan - avsluta intervjun
      const finalMessage = `Tack för att du tog dig tid! 🎉

Jag har nu all information jag behöver för att skapa din personliga AI-strategi. 

Din rapport genereras nu och kommer att skickas till din email inom 10-15 minuter. Den innehåller:

✅ Djupgående analys av dina arbetsflöden
✅ Konkreta AI-verktyg anpassade för dig
✅ Steg-för-steg implementeringsplan
✅ Copy-paste prompts och mallar
✅ Beräknad tidsbesparing per verktyg

Du får även tillgång till din personliga support-chatt i 30 dagar där jag kan svara på alla frågor!`;

      session.messages.push({
        role: "assistant",
        content: finalMessage,
      });

      // Spara slutförd intervju
      session.completedAt = new Date().toISOString();
      interviewSessions.set(sessionId, session);

      return NextResponse.json({
        isComplete: true,
        finalMessage,
        sessionId,
      });
    }

    // Analysera senaste svaret
    const lastUserAnswer = session.messages[session.messages.length - 1].content;
    const isShortAnswer = lastUserAnswer.split(' ').length < 10;
    
    // Generera nästa fråga
    const nextQuestionPrompt = `
Baserat på tidigare svar, ställ nästa relevanta fråga (fråga ${questionNumber + 1} av ${totalQuestions}).

SENASTE SVAR: "${lastUserAnswer}"
${isShortAnswer ? "⚠️ DETTA SVAR ÄR FÖR KORT! Be användaren utveckla innan du går vidare till ny fråga." : ""}

FOKUSOMRÅDEN att täcka (prioritera de som saknas):
1. Typisk arbetsdag - konkret tidslinje (8:00, 9:00, etc.)
2. Största tidsslukare - EXAKTA uppgifter (t.ex. "dokumentation tar 3h/dag")
3. Nuvarande verktyg - vilka system använder du? (Word, Excel, journalsystem, etc.)
4. Teknisk kompetens - på en skala 1-10, hur bekväm är du med ny teknik?
5. Samarbete - arbetar du ensam eller i team? Hur kommunicerar ni?
6. Återkommande uppgifter - vilka saker gör du VARJE dag/vecka?
7. Dokumentation - hur mycket tid går till rapporter, journaler, email?
8. Kommunikation - med vem pratar du mest? (kollegor/kunder/chefer)
9. Frustration - vad hade du velat automatisera bort?
10. Mål - vad vill du uppnå med AI? (mer tid, mindre stress, bättre kvalitet?)
11. Inlärningstid - hur mycket tid kan du lägga på att lära dig nya verktyg? (1h/vecka, 5h/vecka?)
12. Budget - hur mycket kan du/arbetsgivaren betala för AI-verktyg per månad?

REGLER:
- Om svaret är för kort/vagt: Be om MER DETALJER på SAMMA område
- Om svaret är bra: Gå vidare till nästa fokusområde
- Var specifik: Fråga om EXAKTA siffror, KONKRETA exempel
- Använd följdfrågor: "Du nämnde X, kan du ge ett exempel?"

Ställ EN fråga. Var personlig och empatisk. Endast frågan, inget annat.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        ...session.messages,
        { role: "user", content: nextQuestionPrompt },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const nextQuestion = completion.choices[0].message.content || "Kan du berätta mer?";

    session.messages.push({
      role: "assistant",
      content: nextQuestion,
    });

    // Uppdatera session
    interviewSessions.set(sessionId, session);

    return NextResponse.json({
      isComplete: false,
      nextQuestion,
      questionNumber: questionNumber + 1,
    });
  } catch (error) {
    console.error("Error continuing premium interview:", error);
    return NextResponse.json(
      { error: "Kunde inte fortsätta intervjun" },
      { status: 500 }
    );
  }
}

