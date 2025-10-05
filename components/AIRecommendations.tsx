"use client";

import { useState, useEffect } from "react";
import FeedbackSystem from "@/components/FeedbackSystem";
import ImplementationPlan from "@/components/ImplementationPlan";
import StructuredData from "@/components/StructuredData";
import ProfessionPrompts from "@/components/ProfessionPrompts";
import ShareResults from "@/components/ShareResults";
import FeedbackButton from "@/components/FeedbackButton";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { getIconForContent } from "./Icons";
import DifficultyBar from "./DifficultyBar";
import ShareButtons from "@/components/ShareButtons";
import LoadingAnalysis from "@/components/LoadingAnalysis";
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
  onDataLoaded?: () => void;
  showLoadingState?: boolean;
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
  onDataLoaded,
  showLoadingState = true,
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("scenarios");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showMagicLinkModal, setShowMagicLinkModal] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
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
      
      // Notify parent that demo data is loaded
      if (onDataLoaded) {
        onDataLoaded();
      }
      
      return;
    }

    // Real API call
    fetchRecommendations();
  }, [isDemo, onDataLoaded]);

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
      
      // Save results to sessionStorage for back navigation
      sessionStorage.setItem("lastResults", JSON.stringify({
        profession,
        specialization,
        experience,
        challenges,
        tasks,
        scenarios: data.scenarios || [],
        recommendations: data.recommendations || [],
        timestamp: Date.now()
      }));
      
      // Notify parent that data is loaded
      if (onDataLoaded) {
        onDataLoaded();
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Kunde inte hämta rekommendationer. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && showLoadingState) {
    return <LoadingAnalysis />;
  }

  // Check if profession has prompts
  const professionsWithPrompts = ["Sjuksköterska", "Lärare", "Advokat", "Projektledare"];
  const hasPrompts = professionsWithPrompts.includes(profession);

  const tabs = [
    { id: "scenarios" as TabType, label: "Användningsfall", count: scenarios.length },
    { id: "tools" as TabType, label: "AI-verktyg", count: recommendations.length },
    ...(hasPrompts ? [{ id: "prompts" as TabType, label: "Färdiga prompts", count: null }] : []),
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

          {/* Tabs - mobile optimized */}
          <div className="mt-8">
            {/* Mobile: Horizontal scroll */}
            <div className="sm:hidden overflow-x-auto -mx-4 px-4">
              <div className="flex gap-2 pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                    {tab.count && (
                      <span className="ml-1 text-xs opacity-80">({tab.count})</span>
                    )}
                  </button>
                ))}
                {!isDemo && (
                  <button
                    onClick={() => router.push("/premium/purchase")}
                    className="ml-2 px-4 py-2 bg-blue-900 text-white rounded-lg font-medium text-sm whitespace-nowrap hover:bg-blue-800 transition-all duration-200 animate-pulse-slow shadow-md"
                  >
                    Köp fullständig analys
                  </button>
                )}
              </div>
            </div>
            
            {/* Desktop: Normal flex */}
            <div className="hidden sm:flex flex-wrap justify-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-w-[160px] px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
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
              {!isDemo && (
                <button
                  onClick={() => router.push("/premium/purchase")}
                  className="ml-4 min-w-[200px] px-6 py-3 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-800 transition-all duration-200 animate-pulse-slow shadow-md"
                >
                  Köp fullständig analys
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Mobile optimized */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Scenarios tab */}
        {activeTab === "scenarios" && (
          <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
            {scenarios.map((scenario, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    {getIconForContent(scenario.title, scenario.situation)}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {scenario.title}
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Situation</p>
                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{scenario.situation}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Lösning</p>
                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{scenario.solution}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Rekommenderade verktyg:</p>
                    <div className="flex flex-wrap gap-2">
                      {scenario.tools.map((tool, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
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
          <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
            {recommendations.slice(0, 5).map((rec, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setExpandedCard(expandedCard === index ? null : index)}
              >
                <div className="mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                      {getIconForContent(rec.name, rec.description)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {rec.name}
                        </h3>
                        <span className="text-sm font-medium px-3 py-1.5 bg-gray-900 text-white rounded-lg mt-2 sm:mt-0">
                          {rec.timeSaved}
                        </span>
                      </div>
                      <p className="text-gray-600 text-base sm:text-lg leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-4">
                    <p className="text-gray-700 text-base leading-relaxed">{rec.useCase}</p>
                  </div>
                  
                  <DifficultyBar level={rec.difficulty} />
                </div>

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
            
            {/* Blurred premium tools */}
            {!isDemo && recommendations.length > 3 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent z-10 pointer-events-none"></div>
                  <div className="filter blur-sm opacity-60">
                    <div className="card p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {recommendations.length > 3 ? recommendations[3].name : "Claude AI Pro"}
                          </h3>
                          <p className="text-gray-600">
                            Premium AI-verktyg för avancerad textanalys och kodgenerering
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                          🔒 Premium
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-3 rounded-full mb-4">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{recommendations.length - 3} fler verktyg tillgängliga i Premium</span>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Lås upp alla {recommendations.length} AI-verktyg specifikt utvalda för {specialization || profession}
                  </p>
                </div>
              </>
            )}
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

      {/* Save results link */}
      {!isDemo && (
        <div className="text-center mt-12">
            <button
              onClick={() => setShowMagicLinkModal(true)}
              className="text-gray-500 hover:text-gray-900 text-sm underline"
            >
              Spara resultat och få länk via email
            </button>
        </div>
      )}

      {/* Share section - Mobile optimized */}
      {!isDemo && (
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mt-8 sm:mt-12">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">🎉 Dela med dina kollegor!</h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
            Hjälp andra {profession.toLowerCase()}s att spara tid med AI
          </p>
          <ShareButtons
            profession={profession}
            specialization={specialization}
            timeSaved="8-12 timmar per vecka"
          />
          <p className="text-gray-500 text-xs mt-3 sm:mt-4">
            💡 Tips: För varje kollega som testar får du en månad extra support gratis!
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="border-t border-gray-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
        </div>
      </div>
      
      {/* Feedback button */}
      {!isDemo && (
        <FeedbackButton 
          context={{ profession, specialization }} 
        />
      )}

      {/* Exit Intent Popup */}
      {!isDemo && showExitIntent && (
        <ExitIntentPopup
          profession={profession}
          specialization={specialization}
          onClose={() => setShowExitIntent(false)}
          onUpgrade={() => {
            setShowExitIntent(false);
            router.push("/premium/interview");
          }}
        />
      )}

      {/* Magic Link Modal */}
      {showMagicLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Spara ditt resultat
            </h3>
            <p className="text-gray-600 mb-6">
              Få en länk via email så du kan komma tillbaka när som helst (giltig i 7 dagar)
            </p>
            
            {!magicLinkSent ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch("/api/magic-link/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: magicLinkEmail,
                      resultData: {
                        profession,
                        specialization,
                        experience,
                        challenges,
                        tasks,
                        scenarios,
                        recommendations
                      }
                    })
                  });
                  
                  if (response.ok) {
                    setMagicLinkSent(true);
                  }
                } catch (error) {
                  console.error("Failed to send magic link:", error);
                }
              }}>
                <input
                  type="email"
                  value={magicLinkEmail}
                  onChange={(e) => setMagicLinkEmail(e.target.value)}
                  placeholder="din@email.se"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none mb-4"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMagicLinkModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-3"
                  >
                    Skicka länk
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-2">Länk skickad!</p>
                <p className="text-gray-600 text-sm mb-6">
                  Kolla din email ({magicLinkEmail}) för att komma tillbaka
                </p>
                <button
                  onClick={() => {
                    setShowMagicLinkModal(false);
                    setMagicLinkSent(false);
                    setMagicLinkEmail("");
                  }}
                  className="btn-primary px-6 py-2"
                >
                  Stäng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}