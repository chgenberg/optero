"use client";

import { useState, useEffect } from "react";
import FeedbackSystem from "@/components/FeedbackSystem";
import ImplementationPlan from "@/components/ImplementationPlan";
import PremiumUpgrade from "@/components/PremiumUpgrade";
import StructuredData from "@/components/StructuredData";
import ProfessionPrompts from "@/components/ProfessionPrompts";
import ShareResults from "@/components/ShareResults";
import { useRouter } from "next/navigation";

interface Scenario {
  title: string;
  situation: string;
  solution: string;
  tools: string[];
}

interface Recommendation {
  name: string;
  description: string;
  useCase: string;
  timeSaved: string;
  difficulty: string;
  link: string;
  tips?: string[];
}

interface AIRecommendationsProps {
  profession: string;
  specialization: string;
  experience: string;
  challenges: string[];
  tasks: { task?: string; name?: string; priority: number }[];
  onReset: () => void;
  isDemo?: boolean;
}

type TabType = "scenarios" | "tools" | "prompts" | "plan";

export default function AIRecommendations({
  profession,
  specialization,
  experience,
  challenges,
  tasks,
  onReset,
  isDemo = false,
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("scenarios");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isDemo) {
      // Realistic mock data for demo
      setScenarios([
        {
          title: "Automatisera fakturahantering med AI-OCR",
          situation: "Som ekonomiassistent spenderar du 6-8 timmar per vecka på att manuellt mata in leverantörsfakturor i systemet. Varje faktura tar 3-5 minuter att behandla, och risken för felaktig inmatning är alltid närvarande.",
          solution: "Med AI-driven OCR-teknik kan du skanna fakturor (via mobil eller scanner) och automatiskt läsa av leverantör, belopp, datum, momssats och konteringsförslag. Systemet lär sig dina konteringsmönster och blir smartare över tid. Resultat: 90% av fakturorna bokförs automatiskt, endast 10% behöver manuell granskning. Tidsbesparing: 5-6 timmar per vecka.",
          tools: ["Dooap", "Fortnox AI", "Klippa", "Bokio Smart Scan"],
        },
        {
          title: "Smarta månadsrapporter med AI-analys",
          situation: "Varje månad sammanställer du ekonomiska rapporter för ledningen. Det tar 4-5 timmar att samla data från olika system, skapa grafer, och skriva sammanfattande text som förklarar avvikelser och trender.",
          solution: "AI-verktyg kan automatiskt hämta data från alla dina system (Fortnox, lönesystem, bankkonton), skapa visuella rapporter och generera förklarande text baserat på siffrorna. ChatGPT kan analysera dina siffror och förklara varför kostnaderna ökat i en viss kategori eller varför likviditeten förändrats. Tidsbesparing: 3-4 timmar per månad.",
          tools: ["ChatGPT Advanced Data Analysis", "Power BI med AI", "Qlik Sense", "Fortnox Rapporter"],
        },
        {
          title: "Intelligent kontostämning och avvikelsehantering",
          situation: "Kontostämning av leverantörsreskontra, kundreskontra och bankkonton tar 3-4 timmar varje månad. Du måste manuellt leta efter avvikelser, obesvarade frågor och felaktiga posteringar.",
          solution: "AI kan automatiskt jämföra transaktioner mellan olika system, identifiera avvikelser över ett visst belopp, och flagga ovanliga mönster (t.ex. dubbla betalningar, saknade fakturor). Systemet kan även föreslå korrigeringar baserat på historiska data. Tidsbesparing: 2-3 timmar per månad.",
          tools: ["Fortnox Avstämning", "Bokio Smart Match", "ChatGPT för analys", "Excel med Power Query"],
        },
        {
          title: "Automatiserad momshantering och deklaration",
          situation: "Varje kvartal spenderar du 5-6 timmar på att granska momstransaktioner, kontrollera att allt är korrekt kodat, och förbereda momsdeklarationen. Fel i momshanteringen kan leda till dyra konsekvenser.",
          solution: "AI-verktyg kan automatiskt kategorisera transaktioner efter momssats (25%, 12%, 6%, 0%), identifiera potentiella fel (t.ex. fel momskod på en transaktion), och generera momsrapporten automatiskt. Vissa system kan till och med skicka in deklarationen direkt till Skatteverket. Tidsbesparing: 4-5 timmar per kvartal.",
          tools: ["Fortnox Moms", "Bokio Momsdeklaration", "Dooap Smart Moms", "ChatGPT för kontroll"],
        },
        {
          title: "Effektiv lönehantering med AI-stöd",
          situation: "Lönehanteringen tar 6-8 timmar varje månad: samla tidrapporter, kontrollera frånvaro, beräkna övertid, hantera semesterdagar, och skapa löneunderlag. Manuella fel kan leda till missnöjda medarbetare.",
          solution: "AI-drivna lönesystem kan automatiskt hämta tidrapporter från tidrapporteringssystem, beräkna lön baserat på avtal och regler, hantera semesterdagar automatiskt, och flagga avvikelser (t.ex. ovanligt mycket övertid). ChatGPT kan hjälpa dig tolka kollektivavtal och svara på löneadministrativa frågor. Tidsbesparing: 4-5 timmar per månad.",
          tools: ["Visma Lön Smart", "Kontek AI", "Agda Lön", "ChatGPT för regeltolkning"],
        },
      ]);
      
      setRecommendations([
        {
          name: "ChatGPT Plus (med Advanced Data Analysis)",
          description: "Den mest mångsidiga AI-assistenten för ekonomiassistenter. Kan analysera Excel-filer, skapa rapporter, förklara ekonomiska begrepp, och hjälpa dig med bokföringsregler.",
          useCase: "Analysera ekonomiska data, skapa rapporttexter, tolka BAS-kontoplanen, förklara momsregler, generera konteringsförslag, skapa pivottabeller och grafer från rådata.",
          timeSaved: "5-8 timmar per vecka",
          difficulty: "Lätt",
          link: "https://chat.openai.com",
          tips: [
            "Ladda upp Excel-filer för automatisk analys och visualisering",
            "Be ChatGPT skapa mallar för återkommande rapporter",
            "Använd för att tolka komplicerade skatteregler och bokföringsregler",
            "Skapa makron och formler för Excel automatiskt",
            "Få förklaringar av avvikelser i dina siffror"
          ],
        },
        {
          name: "Dooap (AI-driven bokföring)",
          description: "Svenskt AI-verktyg specialiserat på automatisk fakturahantering och bokföring. Läser fakturor med OCR och lär sig dina konteringsmönster.",
          useCase: "Automatisk inläsning av leverantörsfakturor, smart konteringsförslag baserat på historik, automatisk matchning mot inköpsorder, integration med svenska ekonomisystem.",
          timeSaved: "4-6 timmar per vecka",
          difficulty: "Medel",
          link: "https://dooap.com",
          tips: [
            "Träna systemet genom att granska och godkänna förslag första månaden",
            "Använd mobilappen för att skanna kvitton direkt på plats",
            "Sätt upp automatiska godkännanderegler för återkommande leverantörer",
            "Integrera med Fortnox/Visma för sömlöst arbetsflöde"
          ],
        },
        {
          name: "Fortnox AI-assistent",
          description: "Inbyggd AI direkt i Fortnox som ger smarta konteringsförslag, automatisk fakturaläsning och intelligent rapportering.",
          useCase: "Smart kontering av transaktioner, automatisk kategorisering av kostnader, AI-genererade rapporter, prediktiv analys av kassaflöde.",
          timeSaved: "3-5 timmar per vecka",
          difficulty: "Lätt",
          link: "https://fortnox.se",
          tips: [
            "Aktivera AI-funktionerna i inställningarna",
            "Använd 'Smart Scan' för att fotografera fakturor med mobilen",
            "Låt AI:n föreslå kontering och granska innan du godkänner",
            "Använd AI-rapporterna för snabb månadsavslut"
          ],
        },
        {
          name: "Klippa SpendControl",
          description: "AI-driven kvitto- och fakturahantering med OCR-teknik. Perfekt för utlägg och resekostnader.",
          useCase: "Automatisk inläsning av kvitton, utläggshantering, reseräkningar, integration med ekonomisystem, automatisk momsavdrag.",
          timeSaved: "2-4 timmar per vecka",
          difficulty: "Lätt",
          link: "https://klippa.com",
          tips: [
            "Använd mobilappen för att anställda kan skanna kvitton direkt",
            "Sätt upp automatiska påminnelser för utläggsrapporter",
            "Integrera med Fortnox för automatisk bokföring",
            "Använd AI-kategorisering för att automatiskt sortera kostnader"
          ],
        },
        {
          name: "Microsoft Excel med Copilot",
          description: "Excel med AI-assistent som kan skapa formler, analysera data, generera grafer och förklara komplexa beräkningar.",
          useCase: "Skapa avancerade formler med naturligt språk, automatisk dataanalys, generera pivottabeller, skapa prognoser baserat på historisk data.",
          timeSaved: "3-4 timmar per vecka",
          difficulty: "Lätt",
          link: "https://microsoft.com/excel",
          tips: [
            "Be Copilot skapa formler genom att beskriva vad du vill göra",
            "Använd för att snabbt analysera stora datamängder",
            "Låt AI:n föreslå visualiseringar baserat på din data",
            "Skapa automatiska rapportmallar med AI-stöd"
          ],
        },
      ]);
      
      setLoading(false);
      return;
    }

    // Real API call
    fetchRecommendations();
  }, [isDemo]);

  const fetchRecommendations = async () => {
    try {
      const normalizedTasks = tasks.map((t) => ({
        task: t.task || t.name || "",
        priority: t.priority,
      }));

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession,
          specialization,
          experience,
          challenges,
          tasks: normalizedTasks,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch recommendations");

      const data = await response.json();
      setScenarios(data.scenarios || []);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Kunde inte hämta rekommendationer. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-gray-600">Analyserar dina behov...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "scenarios" as TabType, label: "Användningsfall", count: scenarios.length },
    { id: "tools" as TabType, label: "AI-verktyg", count: recommendations.length },
    { id: "prompts" as TabType, label: "Färdiga prompts", count: null },
    { id: "plan" as TabType, label: "Din plan", count: null },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* SEO structured data */}
      {recommendations.length > 0 && !isDemo && (
        <StructuredData
          profession={profession}
          specialization={specialization}
          recommendations={recommendations}
        />
      )}

      {/* Header section */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              AI-verktyg för {specialization || profession}
            </h1>
            <p className="text-lg text-gray-600">
              Vi hittade {recommendations.length} verktyg som kan spara dig tid
            </p>
          </div>

          {/* Tabs - minimal design */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
                {tab.count && (
                  <span className="ml-2 text-sm opacity-80">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Scenarios tab */}
        {activeTab === "scenarios" && (
          <div className="grid gap-6 animate-fade-in-up">
            {scenarios.map((scenario, index) => (
              <div
                key={index}
                className="card group hover:shadow-xl"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {scenario.title}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Situation:</p>
                    <p className="text-gray-700">{scenario.situation}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Lösning:</p>
                    <p className="text-gray-700">{scenario.solution}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Rekommenderade verktyg:</p>
                    <div className="flex flex-wrap gap-2">
                      {scenario.tools.map((tool, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-900 text-white text-sm rounded-full"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tools tab */}
        {activeTab === "tools" && (
          <div className="grid gap-6 animate-fade-in-up">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="card-interactive"
                onClick={() => setExpandedCard(expandedCard === index ? null : index)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {rec.name}
                    </h3>
                    <p className="text-gray-600">{rec.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      rec.difficulty === 'Lätt' 
                        ? 'bg-green-100 text-green-800' 
                        : rec.difficulty === 'Medel' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {rec.difficulty}
                    </span>
                    <span className="text-sm font-medium px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {rec.timeSaved}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{rec.useCase}</p>

                {expandedCard === index && (
                  <div className="pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
                    {rec.tips && rec.tips.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Tips:</p>
                        <ul className="space-y-1">
                          {rec.tips.map((tip, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-gray-400 mr-2">•</span>
                              <span className="text-gray-600 text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <a
                        href={rec.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Testa verktyget
                      </a>
                      <FeedbackSystem
                        recommendationId={index + 1}
                        recommendationName={rec.name}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Prompts tab */}
        {activeTab === "prompts" && (
          <div className="animate-fade-in-up">
            <ProfessionPrompts profession={profession} />
          </div>
        )}

        {/* Plan tab */}
        {activeTab === "plan" && (
          <div className="animate-fade-in-up">
            <ImplementationPlan
              recommendations={recommendations}
              profession={profession}
              specialization={specialization}
            />
            
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-gray-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onReset}
                className="btn-secondary"
              >
                Gör en ny analys
              </button>
              
              <ShareResults
                profession={profession}
                specialization={specialization}
                recommendations={recommendations}
                scenarios={scenarios}
              />
            </div>
            
            {!isDemo && (
              <PremiumUpgrade
                profession={profession}
                specialization={specialization}
                onUpgrade={() => router.push("/premium/interview")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}