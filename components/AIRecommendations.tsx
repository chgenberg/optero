"use client";

import { useState, useEffect } from "react";
import FeedbackSystem from "@/components/FeedbackSystem";
import ImplementationPlan from "@/components/ImplementationPlan";
import PremiumUpgrade from "@/components/PremiumUpgrade";
import StructuredData from "@/components/StructuredData";
import ProfessionPrompts from "@/components/ProfessionPrompts";
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
      // Mock data for demo
      setScenarios([
        {
          title: "Automatisera fakturahantering",
          situation: "Du spenderar timmar varje vecka på att mata in fakturadata manuellt.",
          solution: "Med AI-driven OCR kan du skanna fakturor och automatiskt föra in dem i ekonomisystemet med 99% noggrannhet.",
          tools: ["Dooap", "Fortnox AI", "Klippa"],
        },
        {
          title: "Smarta bokslutsprognoser",
          situation: "Svårt att ge företagsledningen exakta prognoser för kvartalsresultat.",
          solution: "AI analyserar historisk data och trender för att ge tillförlitliga prognoser och identifiera avvikelser tidigt.",
          tools: ["Pleo Insights", "Spendesk", "Excel + ChatGPT"],
        },
        {
          title: "Effektivare lönehantering",
          situation: "Löneunderlag tar lång tid att sammanställa och kontrollera.",
          solution: "Automatisera tidrapportering, beräkningar och kontroller. AI flaggar för avvikelser och föreslår korrigeringar.",
          tools: ["Kontek", "Visma AI", "Zapier"],
        },
      ]);
      
      setRecommendations([
        {
          name: "ChatGPT Plus",
          description: "Din AI-assistent för allt från bokföring till rapporter",
          useCase: "Skapa bokföringsunderlag, analysera siffror, skriv rapporter",
          timeSaved: "5-8h/vecka",
          difficulty: "Lätt",
          link: "https://chat.openai.com",
          tips: ["Använd Excel-plugin för dataanalys", "Skapa mallar för återkommande uppgifter"],
        },
        {
          name: "Dooap",
          description: "AI-driven fakturahantering och bokföring",
          useCase: "Automatisk fakturaläsning och kontering",
          timeSaved: "3-5h/vecka",
          difficulty: "Medel",
          link: "https://dooap.com",
        },
        {
          name: "Fortnox AI-assistent",
          description: "Inbyggd AI direkt i Fortnox",
          useCase: "Smart kontering och bokföringsförslag",
          timeSaved: "2-4h/vecka",
          difficulty: "Lätt",
          link: "https://fortnox.se",
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
            <button
              onClick={onReset}
              className="btn-secondary"
            >
              Gör en ny analys
            </button>
            
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