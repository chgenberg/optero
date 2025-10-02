"use client";

import { useState, useEffect } from "react";
import FeedbackSystem from "@/components/FeedbackSystem";
import ChatAssistant from "@/components/ChatAssistant";
import ImplementationPlan from "@/components/ImplementationPlan";
import PremiumUpgrade from "@/components/PremiumUpgrade";
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

type TabType = "scenarios" | "tools" | "plan";

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
  const [loadingMessage, setLoadingMessage] = useState("Analyserar din yrkesgrupp...");
  const [showThinking, setShowThinking] = useState(false);
  const [inferredTasks, setInferredTasks] = useState<string[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<TabType>("scenarios");
  const router = useRouter();

  // Lokal fallback om AI:t inte kan leverera
  const buildLocalFallback = (): {
    scenarios: Scenario[];
    recommendations: Recommendation[];
    inferredTasks: string[];
  } => {
    const role = specialization || profession;
    const baseTasks = tasks?.map((t) => t.task || t.name || "")?.filter(Boolean) || [];
    const inferred: string[] = baseTasks.length > 0
      ? baseTasks
      : [
          "Planera och prioritera arbetsuppgifter",
          "Kommunikation och dokumentation",
          "Möten och uppföljning",
          "Informationssökning och research",
          "Rapportering och sammanställning",
          "Ärendeflöden och administrationssteg"
        ];

    const scenarios: Scenario[] = [
      {
        title: "Svara på mejl 3× snabbare",
        situation: `Du lägger mycket tid på att skriva och besvara mejl i rollen som ${role.toLowerCase()}.`,
        solution: "Med en skrivassistent kan du generera utkast, förbättra ton, sammanfatta långa trådar och skapa svarsalternativ med ett klick.",
        tools: ["ChatGPT", "Copilot", "Gmail/Outlook Add‑on"],
      },
      {
        title: "Mötesanteckningar som skriver sig själva",
        situation: "Möten tar tid och det är lätt att missa beslut och action points.",
        solution: "Spela in och transkribera möten automatiskt, få sammanfattning med beslut, ansvariga och deadlines skickade till rätt personer.",
        tools: ["Whisper", "Otter.ai", "Zapier"],
      },
      {
        title: "Automatisera återkommande rutiner",
        situation: "Många arbetsmoment repeteras varje vecka och stjäl fokus från värdeskapande arbete.",
        solution: "Skapa enkla automationer som kopplar ihop dina verktyg och triggar rätt steg baserat på händelser och formulär.",
        tools: ["Zapier", "Make", "Google Sheets/Notion"],
      },
    ];

    const recommendations: Recommendation[] = [
      {
        name: "ChatGPT Plus",
        description: "Skriv‑ och analysassistent för text, data och filer.",
        useCase: `Snabba upp skrivande, förslag på formuleringar och kunskapsstöd för en ${role.toLowerCase()}.`,
        timeSaved: "3–10 h/vecka",
        difficulty: "Lätt",
        link: "https://chat.openai.com",
        tips: [
          "Klistra in underlag och be om punktlistor + utkast",
          "Be om 3 alternativa tonlägen (formellt, neutralt, service)",
          "Låt den skapa checklistor och mallar för dina återkommande uppgifter",
          "Använd Code Interpreter för Excel/CSV‑filer"
        ],
      },
      {
        name: "Perplexity",
        description: "Snabb faktakoll och research med källhänvisningar.",
        useCase: `Få korrekta sammanfattningar och källor för beslut i rollen som ${role.toLowerCase()}.`,
        timeSaved: "1–4 h/vecka",
        difficulty: "Lätt",
        link: "https://www.perplexity.ai",
        tips: [
          "Be om 5 källor och kort jämförelse",
          "Exportera svar till punktlista för snabb delning",
          "Ange svenska/regionala förutsättningar i prompten",
          "Be om motargument för bättre beslutsunderlag"
        ],
      },
      {
        name: "Whisper (transkribering)",
        description: "Automatisk transkribering och sammanfattning av ljud.",
        useCase: "Spela in möten/intervjuer, få text + sammanfattning och action points.",
        timeSaved: "1–3 h/vecka",
        difficulty: "Lätt",
        link: "https://openai.com/research/whisper",
        tips: [
          "Spara ljudfiler i molnmapp och låt en automation transkribera",
          "Be en AI sammanfatta med beslut/ägare/deadline",
          "Spara i ett sökbart kunskapsbibliotek"
        ],
      },
      {
        name: "Zapier/Make (automation)",
        description: "Bygg no‑code‑flöden mellan dina verktyg.",
        useCase: "Skicka data mellan formulär, kalkylblad, e‑post och projektverktyg automatiskt.",
        timeSaved: "2–6 h/vecka",
        difficulty: "Medel",
        link: "https://zapier.com",
        tips: [
          "Börja med en enkel trigger → Slack/e‑post",
          "Logga alla mötesanteckningar i ett kalkylark",
          "Skicka påminnelser när nya rader skapas",
          "Använd filter för att minska brus"
        ],
      },
      {
        name: "Notion AI / Google Docs + AI",
        description: "Skapa mallar, sammanfatta och standardisera dokumentflöden.",
        useCase: `Ta fram mallar för rapporter, checklistor och underlag för en ${role.toLowerCase()}.`,
        timeSaved: "2–5 h/vecka",
        difficulty: "Lätt",
        link: "https://www.notion.so/product/ai",
        tips: [
          "Skapa en mall per återkommande leverabel",
          "Lägg in checklistor och rollspecifika instruktioner",
          "Bygg en kunskapsbas med sökbara sidor",
          "Använd AI‑summaries för att få TL;DR"
        ],
      },
    ];

    return { scenarios, recommendations, inferredTasks: inferred };
  };

  useEffect(() => {
    if (isDemo) {
      // Sätt demo-data direkt
      setTimeout(() => {
        setScenarios([
          {
            title: "Månadsrapport på 2 timmar istället för 2 dagar",
            situation: "Varje månad spenderar du 16 timmar på att sammanställa rapporter från olika system, dubbelkolla siffror och formatera för ledningen.",
            solution: "Med ChatGPT Plus och en Excel-makro kan du automatisera 80% av arbetet. AI:n läser dina rådata, hittar avvikelser och skapar färdiga PowerPoint-presentationer.",
            tools: ["ChatGPT Plus", "Excel Macros", "Power BI"]
          },
          {
            title: "Leverantörsfakturor som bokför sig själva",
            situation: "Du hanterar 200+ fakturor per vecka och måste manuellt mata in varje rad, kontrollera momskoder och kontera rätt.",
            solution: "Ett AI-verktyg som Klippa eller Docsumo scannar fakturorna, extraherar all data och föreslår kontering baserat på tidigare mönster. Du behöver bara godkänna.",
            tools: ["Klippa", "Docsumo", "Integration med ekonomisystem"]
          },
          {
            title: "Kundreskontra som sköter sig själv",
            situation: "Påminnelser, inkassohot och uppföljning av förfallna fakturor tar 5-6 timmar varje vecka och är repetitivt arbete.",
            solution: "En AI-assistent kan automatiskt skicka personliga påminnelser, föreslå betalningsplaner och flagga för riskabla kunder innan de blir ett problem.",
            tools: ["Fortnox AI", "Zapier", "ChatGPT för mail"]
          }
        ]);
        
        setRecommendations([
          {
            name: "ChatGPT Plus för ekonomer",
            description: "Din personliga AI-assistent som förstår ekonomi och kan hjälpa med allt från bokföring till analys",
            useCase: "Perfekt för att analysera data, skapa rapporter och få svar på komplexa ekonomifrågor",
            timeSaved: "10-15 timmar/vecka",
            difficulty: "Lätt",
            link: "https://chat.openai.com",
            tips: [
              "Börja med att ladda upp en balansräkning och be om analys",
              "Använd 'Code Interpreter' för att arbeta med Excel-filer direkt",
              "Skapa mallar för återkommande rapporter",
              "Be om förklaringar av komplexa ekonomiska begrepp"
            ]
          },
          {
            name: "Klippa - Smart fakturahantering",
            description: "AI-driven fakturascanning som automatiskt läser, tolkar och bokför leverantörsfakturor",
            useCase: "Slipper manuell inmatning av fakturadata och minskar risken för fel",
            timeSaved: "5-8 timmar/vecka",
            difficulty: "Medel",
            link: "https://www.klippa.com/sv/",
            tips: [
              "Integrera direkt med ditt ekonomisystem",
              "Sätt upp automatiska regler för vanliga leverantörer",
              "Använd AI:n för att upptäcka avvikelser och dubbletter",
              "Skapa separata flöden för olika fakturakategorier"
            ]
          },
          {
            name: "Power BI med AI-insights",
            description: "Microsofts analysverktyg med inbyggd AI som hittar mönster och ger prediktioner",
            useCase: "Skapa interaktiva dashboards som uppdateras automatiskt och ger djupare insikter",
            timeSaved: "8-12 timmar/vecka",
            difficulty: "Avancerad",
            link: "https://powerbi.microsoft.com",
            tips: [
              "Börja med färdiga mallar för ekonomirapporter",
              "Använd 'Quick Insights' för att hitta dolda mönster",
              "Koppla direkt till ekonomisystemet för realtidsdata",
              "Skapa automatiska varningar för nyckeltal"
            ]
          },
          {
            name: "Zapier för ekonomiautomation",
            description: "Kopplar ihop alla dina system och automatiserar repetitiva arbetsflöden",
            useCase: "Automatisera dataöverföring mellan system, skicka påminnelser och uppdatera register",
            timeSaved: "3-5 timmar/vecka",
            difficulty: "Medel",
            link: "https://zapier.com",
            tips: [
              "Börja med att automatisera fakturapåminnelser",
              "Skapa flöden som uppdaterar flera system samtidigt",
              "Använd filter för att hantera olika scenarios",
              "Testa automatisering av rapportdistribution"
            ]
          },
          {
            name: "Claude för ekonomisk analys",
            description: "Antropics AI som är särskilt bra på att analysera dokument och ge djupa insikter",
            useCase: "Analysera årsredovisningar, skapa prognoser och få second opinions på komplexa frågor",
            timeSaved: "5-7 timmar/vecka",
            difficulty: "Lätt",
            link: "https://claude.ai",
            tips: [
              "Ladda upp hela årsredovisningar för analys",
              "Be om jämförelser med branschstandard",
              "Använd för att skapa första utkast till rapporter",
              "Få hjälp med komplexa skattefrågor"
            ]
          }
        ]);
        
        setInferredTasks([
          "Bokföra leverantörsfakturor",
          "Stämma av konton",
          "Skapa månadsrapporter",
          "Hantera kundfakturor",
          "Följa upp betalningar"
        ]);
        
        setLoading(false);
      }, 1500); // End of setTimeout
      
      return;
    } // End of isDemo if-block
    
    fetchRecommendations();
    // Animera laddningsmeddelanden med längre intervall
    const messages = [
      "Analyserar din yrkesgrupp...",
      "Identifierar verkliga utmaningar i din vardag...",
      "Skapar realistiska scenarion från ditt arbete...",
      "Funderar på bästa lösningen för dig...",
      "Matchar AI-verktyg mot dina behov...",
      "Skapar personliga rekommendationer...",
      "Nästan klar..."
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 4000);
    return () => clearInterval(interval);
  }, [isDemo]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession, specialization, experience, challenges, tasks }),
      });

      if (!response.ok) throw new Error("Kunde inte hämta rekommendationer");

      const data = await response.json();
      const gotRecs: Recommendation[] = Array.isArray(data?.recommendations) ? data.recommendations : [];
      const gotScenarios: Scenario[] = Array.isArray(data?.scenarios) ? data.scenarios : [];
      const gotTasks: string[] = Array.isArray(data?.inferredTasks) ? data.inferredTasks : [];

      if (gotRecs.length === 0 && gotScenarios.length === 0) {
        const fallback = buildLocalFallback();
        setRecommendations(fallback.recommendations);
        setScenarios(fallback.scenarios);
        setInferredTasks(fallback.inferredTasks);
      } else {
        setRecommendations(gotRecs);
        setScenarios(gotScenarios);
        if (gotTasks.length > 0) setInferredTasks(gotTasks);
      }
    } catch (err) {
      // Om API:t fallerar helt: visa lokalt fallback‑innehåll
      const fallback = buildLocalFallback();
      setRecommendations(fallback.recommendations);
      setScenarios(fallback.scenarios);
      setInferredTasks(fallback.inferredTasks);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumUpgrade = async () => {
    try {
      const response = await fetch("/api/premium/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession,
          specialization,
          userContext: { tasks, challenges, experience },
        }),
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        router.push(data.checkoutUrl);
      }
    } catch (error) {
      console.error("Error initiating premium checkout:", error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in-up relative px-4 sm:px-6 lg:px-8 py-4">
      {/* Logo */}
      <div className="flex items-center justify-center mb-4">
        <img src="/Optero_logo.png" alt="Optero" className="h-8 lg:h-10 object-contain" />
      </div>
      
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 overflow-hidden" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-100">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 text-center mb-1">
            Dina AI-rekommendationer
          </h2>
          <p className="text-center text-gray-500 text-sm font-light">
            Skräddarsydda för dig som{" "}
            <span className="font-normal">{specialization.toLowerCase()}</span>
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 lg:py-20">
            <div className="relative">
              <div className="w-16 h-16 lg:w-20 lg:h-20 border-4 border-gray-200 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-16 h-16 lg:w-20 lg:h-20 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-base lg:text-lg text-gray-700 mt-6 lg:mt-8 font-medium animate-pulse px-4 text-center">
              {loadingMessage}
            </p>
            <div className="flex gap-1 mt-4">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 lg:p-8">
            <div className="bg-red-50 border border-red-200 rounded-xl lg:rounded-2xl p-4 lg:p-6">
              <p className="text-red-800 text-sm lg:text-base">{error}</p>
              <button 
                onClick={fetchRecommendations} 
                className="mt-4 px-4 py-2 lg:px-6 lg:py-2 bg-red-600 text-white rounded-lg lg:rounded-xl hover:bg-red-700 transition-all text-sm lg:text-base"
              >
                Försök igen
              </button>
            </div>
          </div>
        )}

        {/* Main Content with Tabs */}
        {!loading && !error && recommendations.length > 0 && (
          <>
            {/* Tab Navigation */}
            <div className="flex flex-col lg:flex-row">
              {/* Mobile/Tablet Tab Navigation */}
              <div className="lg:hidden border-b border-gray-200">
                <div className="flex overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setActiveTab("scenarios")}
                    className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === "scenarios"
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Verkliga exempel
                  </button>
                  <button
                    onClick={() => setActiveTab("tools")}
                    className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === "tools"
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    AI-verktyg
                  </button>
                  <button
                    onClick={() => setActiveTab("plan")}
                    className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === "plan"
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Kom igång
                  </button>
                </div>
              </div>

              {/* Desktop Tab Navigation */}
              <div className="hidden lg:block w-64 border-r border-gray-200 bg-gray-50">
                <nav className="p-4 space-y-1">
                  <button
                    onClick={() => setActiveTab("scenarios")}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === "scenarios"
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>Verkliga exempel</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("tools")}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === "tools"
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                      <span>AI-verktyg</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("plan")}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === "plan"
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Kom igång</span>
                    </div>
                  </button>
                  
                  {/* Visa hur vi tänkte */}
                  {inferredTasks.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowThinking(!showThinking)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg 
                            className={`w-4 h-4 transform transition-transform ${showThinking ? 'rotate-90' : ''}`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span>Visa hur vi tänkte</span>
                        </div>
                      </button>
                      {showThinking && (
                        <div className="mt-2 p-3 bg-white rounded-lg text-xs text-gray-600">
                          <p className="font-semibold mb-2">Vanliga arbetsuppgifter:</p>
                          <ul className="space-y-1">
                            {inferredTasks.map((task, i) => (
                              <li key={i} className="pl-2">• {task}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-6 lg:p-8 overflow-y-auto min-h-[600px] max-h-[800px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {/* Scenarios Tab */}
                  {activeTab === "scenarios" && scenarios.length > 0 && (
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
                      Så här kan AI hjälpa dig i verkligheten
                    </h3>
                    <div className="space-y-4">
                      {scenarios.map((scenario, idx) => (
                        <div 
                          key={idx}
                          className={`relative border-2 rounded-xl lg:rounded-2xl p-4 lg:p-6 transition-all duration-300 cursor-pointer ${
                            expandedScenario === idx 
                              ? 'border-gray-900 bg-gradient-to-br from-white to-gray-50 shadow-xl' 
                              : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                          }`}
                          onClick={() => setExpandedScenario(expandedScenario === idx ? null : idx)}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            <h4 className="font-bold text-gray-900 text-base lg:text-lg flex-1">{scenario.title}</h4>
                          </div>
                          
                          <p className="text-sm lg:text-base text-gray-600 mb-3 pl-11">{scenario.situation}</p>
                          
                          <div className={`transition-all duration-500 overflow-hidden ${
                            expandedScenario === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}>
                            <div className="border-t border-gray-200 pt-3 mt-3 pl-11">
                              <p className="text-xs lg:text-sm font-semibold text-gray-700 mb-2">AI-lösning:</p>
                              <p className="text-sm lg:text-base text-gray-700 mb-3">{scenario.solution}</p>
                              
                              <div className="flex flex-wrap gap-2">
                                {scenario.tools.map((tool, i) => (
                                  <span key={i} className="text-xs lg:text-sm px-3 py-1 bg-gray-900 text-white rounded-full">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {expandedScenario !== idx && (
                            <p className="text-xs lg:text-sm text-gray-400 mt-2 pl-11">Klicka för lösning →</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                  {/* Tools Tab */}
                  {activeTab === "tools" && (
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
                      Rekommenderade AI-verktyg
                    </h3>
                    <div className="space-y-6">
                      {recommendations.map((rec, index) => (
                        <div 
                          key={index} 
                          className={`relative border-2 rounded-xl lg:rounded-2xl p-4 lg:p-6 transition-all duration-300 cursor-pointer transform
                            ${expandedCard === index 
                              ? 'border-gray-900 shadow-2xl scale-[1.02] bg-gradient-to-br from-white to-gray-50' 
                              : 'border-gray-100 hover:border-gray-400 hover:shadow-lg'
                            }`}
                          onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg lg:text-xl font-semibold text-gray-800">{index + 1}. {rec.name}</h3>
                          </div>
                          <p className="text-sm lg:text-base text-gray-600 mb-3">{rec.description}</p>
                          
                          <div className="bg-gray-50 rounded-lg lg:rounded-xl p-3 lg:p-4 mb-4">
                            <p className="text-xs lg:text-sm font-medium text-gray-700 mb-1">Användningsområde för dig:</p>
                            <p className="text-sm lg:text-base text-gray-600">{rec.useCase}</p>
                          </div>

                          <div className="flex gap-3 mb-4">
                            <div className={`flex-1 rounded-lg lg:rounded-xl p-2 lg:p-3 transition-all duration-300 ${
                              expandedCard === index ? 'bg-gray-900 text-white' : 'bg-gray-50'
                            }`}>
                              <p className={`text-xs font-medium mb-1 ${
                                expandedCard === index ? 'text-gray-300' : 'text-gray-600'
                              }`}>Tidsbesparing</p>
                              <p className={`text-sm font-semibold ${
                                expandedCard === index ? 'text-white' : 'text-gray-900'
                              }`}>{rec.timeSaved}</p>
                            </div>
                            <div className={`flex-1 rounded-lg lg:rounded-xl p-2 lg:p-3 transition-all duration-300 ${
                              expandedCard === index ? 'bg-gray-800 text-white' : 'bg-gray-100'
                            }`}>
                              <p className={`text-xs font-medium mb-1 ${
                                expandedCard === index ? 'text-gray-300' : 'text-gray-600'
                              }`}>Svårighetsgrad</p>
                              <p className={`text-sm font-semibold ${
                                expandedCard === index ? 'text-white' : 'text-gray-900'
                              }`}>{rec.difficulty}</p>
                            </div>
                          </div>

                          {rec.tips && rec.tips.length > 0 && (
                            <div className={`transition-all duration-500 overflow-hidden ${
                              expandedCard === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                              <div className="bg-white border border-gray-200 rounded-lg lg:rounded-xl p-3 lg:p-4 mb-4 mt-2">
                                <p className="text-xs lg:text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  Konkreta tips för att komma igång:
                                </p>
                                <div className="space-y-2">
                                  {rec.tips.map((tip, i) => (
                                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                                      <input 
                                        type="checkbox" 
                                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <span className="text-xs lg:text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{tip}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3">
                            <a 
                              href={rec.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-gray-900 text-white rounded-lg lg:rounded-xl hover:bg-gray-800 hover:scale-105 transition-all duration-200 text-sm lg:text-base"
                            >
                              Läs mer & kom igång
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            
                            <div className="text-xs lg:text-sm text-gray-500">
                              Klicka på kortet för mer info
                            </div>
                          </div>

                          <div onClick={(e) => e.stopPropagation()}>
                            <FeedbackSystem recommendationId={index} recommendationName={rec.name} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                  {/* Plan Tab */}
                  {activeTab === "plan" && (
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
                      Din implementeringsplan
                    </h3>
                    <ImplementationPlan 
                      recommendations={recommendations} 
                      profession={profession} 
                      specialization={specialization} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Mobile "Visa hur vi tänkte" for mobile */}
            {inferredTasks.length > 0 && (
              <div className="lg:hidden border-t border-gray-200 p-4">
                <button
                  onClick={() => setShowThinking(!showThinking)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg 
                      className={`w-4 h-4 transform transition-transform ${showThinking ? 'rotate-90' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Visa hur vi tänkte</span>
                  </div>
                </button>
                {showThinking && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                    <p className="font-semibold mb-2">Vanliga arbetsuppgifter:</p>
                    <ul className="space-y-1">
                      {inferredTasks.map((task, i) => (
                        <li key={i} className="pl-2">• {task}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Premium Upgrade CTA - hide in demo mode */}
            {!isDemo && (
              <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                <PremiumUpgrade 
                  profession={profession}
                  specialization={specialization}
                  onUpgrade={handlePremiumUpgrade}
                />
              </div>
            )}

            <ChatAssistant 
              context={{
                profession,
                specialization,
                experience,
                challenges,
                tasks: tasks.map((t) => ({ task: t.task || t.name || "", priority: t.priority })),
                recommendations
              }}
            />
          </>
        )}

        {/* Reset button */}
        <div className="p-6 lg:p-8 border-t border-gray-100 text-center bg-gray-50">
          <button 
            onClick={onReset} 
            className="px-6 py-2 lg:px-8 lg:py-3 bg-gray-900 text-white rounded-lg lg:rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium text-sm lg:text-base"
          >
            Gör en ny analys
          </button>
        </div>
      </div>
    </div>
  );
}