import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Global sessions map
declare global {
  var interviewSessions: Map<string, any>;
}

const interviewSessions = global.interviewSessions || new Map();

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email } = await request.json();

    // Hämta intervju-session
    const session = interviewSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session hittades inte" },
        { status: 404 }
      );
    }

    // Extrahera alla Q&A från intervjun
    const conversationHistory = session.messages
      .filter((m: any) => m.role !== "system")
      .map((m: any) => `${m.role === "assistant" ? "Fråga" : "Svar"}: ${m.content}`)
      .join("\n\n");

    const reportPrompt = `Du är en expert AI-konsult. Skapa en MYCKET DETALJERAD personlig rapport baserat på denna djupintervju:

ANVÄNDARINFO:
Profession: ${session.profession}
Specialisering: ${session.specialization}

INTERVJU:
${conversationHistory}

SKAPA EN KOMPLETT RAPPORT MED FÖLJANDE STRUKTUR:

# PERSONLIG AI-STRATEGI FÖR ${session.profession.toUpperCase()}

## 1. SAMMANFATTNING
- Kort översikt av nuläge
- Huvudsakliga utmaningar
- Största möjligheter

## 2. NULÄGESANALYS
- Detaljerad beskrivning av arbetsflöden
- Identifierade ineffektiviteter
- Tidsanalys (var går tiden?)
- Nuvarande verktyg och system

## 3. REKOMMENDERADE AI-VERKTYG (5-7 stycken)

För varje verktyg:
### Verktyg X: [Namn]
**Vad det gör:** [kort beskrivning]
**Varför just för dig:** [personlig koppling till deras situation]
**Konkret användning:** [3-4 specifika exempel från deras vardag]
**Tidsbesparing:** [realistisk uppskattning]
**Kostnad:** [pris]
**Svårighetsgrad:** [1-5]
**Implementering:** [konkreta steg]

## 4. IMPLEMENTERINGSPLAN

### Vecka 1: [Verktyg]
- Dag 1-2: [konkreta steg]
- Dag 3-5: [konkreta steg]
- Dag 6-7: [konkreta steg]

### Vecka 2-4: [Fortsätt för alla verktyg]

## 5. COPY-PASTE PROMPTS

För varje verktyg, ge 3-5 färdiga prompts de kan använda direkt, t.ex:

**För ChatGPT (Dokumentation):**
\`\`\`
Jag är [titel] och behöver hjälp med [uppgift]. 
Kontext: [...]
Kan du hjälpa mig att [specifik fråga]?
\`\`\`

## 6. MALLAR OCH TEMPLATES

[Konkreta mallar för deras vanligaste uppgifter]

## 7. ROI-KALKYL

| Verktyg | Tidsbesparing/vecka | Värde/månad | Kostnad/månad | Netto |
|---------|---------------------|-------------|---------------|-------|
| ...     | ...                 | ...         | ...           | ...   |

**Total besparing:** [X] timmar/vecka = [Y] kr/månad

## 8. TROUBLE-SHOOTING

Vanliga problem och lösningar:
- [Problem 1]: [Lösning]
- [Problem 2]: [Lösning]

## 9. NÄSTA STEG

1. [Konkret åtgärd 1]
2. [Konkret åtgärd 2]
3. [Konkret åtgärd 3]

## 10. SUPPORT

- 30 dagars tillgång till AI-support chatt
- Länk: [kommer via email]
- Frågor? Svar inom 24h

---

**Skapad:** [datum]
**För:** ${session.profession} (${session.specialization})
**Av:** Optero AI-konsult

Var EXTREMT detaljerad och personlig. Referera till specifika svar från intervjun. Ge KONKRETA, hands-on råd.`;

    const completion = await openai.chat.completions.create({
      model: "o1", // Använd GPT-5 för djup analys
      messages: [
        { role: "user", content: reportPrompt },
      ],
    });

    const reportContent = completion.choices[0].message.content || "Rapport kunde inte genereras";

    // I produktion: Generera PDF och skicka via email
    // För nu: returnera markdown-innehåll

    // Spara rapporten i sessionen
    session.report = reportContent;
    session.reportGeneratedAt = new Date().toISOString();
    session.userEmail = email;
    interviewSessions.set(sessionId, session);

    return NextResponse.json({
      success: true,
      report: reportContent,
      sessionId,
      message: "Rapporten har genererats och kommer skickas till din email inom kort",
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Kunde inte generera rapport" },
      { status: 500 }
    );
  }
}

