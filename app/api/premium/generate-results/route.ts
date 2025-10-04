import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { context, answers } = await request.json();
    const { profession, specialization } = context;

    // Mock data for now - in production this would use GPT-4o to generate
    const mockResults = {
      overview: {
        summary: `Som ${specialization || profession} har du unika möjligheter att spara tid och förbättra kvaliteten i ditt arbete med AI. Baserat på dina svar har vi identifierat flera områden där AI kan göra direkt skillnad, särskilt inom dokumenthantering, kommunikation och dataanalys. Med rätt verktyg och arbetssätt kan du frigöra upp till 8 timmar per vecka för mer värdeskapande arbete.`,
        keyInsights: [
          "Du spenderar över 40% av din tid på repetitiva administrativa uppgifter",
          "Manuell rapportering och dokumentation är din största tidstjuv",
          "AI kan automatisera 70% av din email-hantering",
          "Dataanalys som tar timmar idag kan göras på minuter"
        ],
        timeSavings: "5-8 timmar",
        quickWins: [
          "Börja med ChatGPT för att skriva och svara på email",
          "Använd AI för att sammanfatta långa dokument",
          "Automatisera rapportgenerering med mallar",
          "Låt AI förbereda mötesagendor och anteckningar"
        ]
      },
      detailedTools: [
        {
          name: "ChatGPT Plus",
          description: "Din AI-assistent för skrivande, analys och problemlösning",
          specificUseCase: `För dig som ${specialization || profession} är ChatGPT perfekt för att skriva rapporter, förbereda presentationer, analysera data och svara på komplexa frågor. Du kan spara 2-3 timmar per dag bara på email och dokumentation.`,
          setupGuide: [
            "Skapa konto på chat.openai.com",
            "Uppgradera till Plus för 20$/månad",
            "Installera browser-tillägget för snabb åtkomst",
            "Skapa anpassade instruktioner för din roll",
            "Börja med enkla uppgifter och öka gradvis"
          ],
          prompts: [
            `"Agera som en erfaren ${specialization || profession}. Hjälp mig att..."`,
            `"Analysera denna data och ge mig tre viktiga insikter: [klistra in data]"`,
            `"Skriv ett professionellt svar på detta email: [klistra in email]"`
          ],
          roi: "ROI: 10x"
        },
        {
          name: "Notion AI",
          description: "Intelligent workspace för dokumentation och projekthantering",
          specificUseCase: "Perfekt för att organisera ditt arbete, skapa databaser, och få AI-hjälp direkt i dina dokument. Särskilt kraftfullt för projektplanering och kunskapshantering.",
          setupGuide: [
            "Skapa gratis konto på notion.so",
            "Välj en template som passar din roll",
            "Aktivera Notion AI (10$/månad)",
            "Importera befintliga dokument",
            "Skapa AI-drivna workflows"
          ],
          prompts: [
            `"Sammanfatta detta dokument i 5 punkter"`,
            `"Skapa en projektplan för [projekt]"`,
            `"Generera action items från dessa mötesanteckningar"`
          ],
          roi: "ROI: 8x"
        }
      ],
      implementation: {
        week1: [
          "Skapa konton för ChatGPT och ett dokumentationsverktyg",
          "Genomför grundläggande setup och anpassningar",
          "Testa AI för 3 enkla uppgifter varje dag",
          "Dokumentera vad som fungerar bra"
        ],
        week2: [
          "Börja använda AI för all email-hantering",
          "Skapa mallar för återkommande uppgifter",
          "Experimentera med dataanalys",
          "Dela erfarenheter med en kollega"
        ],
        week3: [
          "Automatisera minst en hel arbetsprocess",
          "Integrera AI i ditt befintliga arbetssätt",
          "Börja använda avancerade prompts",
          "Mät tidsbesparingen"
        ],
        week4: [
          "Utvärdera och optimera dina AI-workflows",
          "Identifiera nästa område att automatisera",
          "Skapa dokumentation för dina AI-processer",
          "Planera långsiktig utveckling"
        ],
        longTerm: [
          "Bli expert på prompt engineering för din bransch",
          "Utforska specialiserade AI-verktyg",
          "Dela kunskap och bli AI-ambassadör",
          "Håll dig uppdaterad med nya verktyg"
        ]
      },
      examples: [
        {
          scenario: "Veckorapport till ledningen",
          before: "2 timmar varje fredag för att sammanställa data, skriva rapport och formatera",
          after: "15 minuter - AI analyserar data, skapar rapport och du gör bara små justeringar",
          timeSaved: "1.75 timmar/vecka",
          toolsUsed: ["ChatGPT", "Excel + AI"]
        },
        {
          scenario: "Kundemail och förfrågningar",
          before: "30-45 minuter per email för att researcha och formulera svar",
          after: "5-10 minuter - AI draft, du personaliserar och skickar",
          timeSaved: "3 timmar/dag",
          toolsUsed: ["ChatGPT", "Gmail AI"]
        }
      ]
    };

    if (openai) {
      // In production, use GPT-4o to generate personalized results based on answers
      // For now, return mock data
    }

    return NextResponse.json(mockResults);
  } catch (error) {
    console.error("Error generating premium results:", error);
    return NextResponse.json(
      { error: "Failed to generate results" },
      { status: 500 }
    );
  }
}
