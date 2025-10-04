"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingAnalysis from "@/components/LoadingAnalysis";

interface UseCaseSolution {
  title: string;
  problem: string;
  solution: string;
  tools: string[];
  timeSaved: string;
  implementation: string;
  roi: string;
}

export default function BusinessResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<UseCaseSolution[]>([]);
  const [totalTimeSaved, setTotalTimeSaved] = useState("");
  const [totalROI, setTotalROI] = useState("");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const analysisData = sessionStorage.getItem("businessAnalysis");
    if (!analysisData) {
      router.push("/business");
      return;
    }

    generateSolutions(JSON.parse(analysisData));
  }, []);

  const generateSolutions = async (data: any) => {
    try {
      const response = await fetch("/api/business/generate-solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setSolutions(result.solutions || getMockSolutions());
        setTotalTimeSaved(result.totalTimeSaved || "20-50h/vecka");
        setTotalROI(result.totalROI || "150,000kr/år");
      } else {
        // Use mock data if API fails
        setSolutions(getMockSolutions());
        setTotalTimeSaved("20-50h/vecka");
        setTotalROI("150,000kr/år");
      }
    } catch (error) {
      console.error("Failed to generate solutions:", error);
      // Use mock data
      setSolutions(getMockSolutions());
      setTotalTimeSaved("20-50h/vecka");
      setTotalROI("150,000kr/år");
    } finally {
      setLoading(false);
    }
  };

  const getMockSolutions = (): UseCaseSolution[] => [
    {
      title: "Automatisera CRM-uppdateringar",
      problem: "Säljare spenderar 3h/dag på manuell datainmatning i CRM",
      solution: "Implementera AI-driven CRM-automation som automatiskt loggar emails, samtal och möten. Använd NLP för att extrahera nyckelinformation från konversationer.",
      tools: ["Salesforce Einstein", "HubSpot AI", "Gong.io"],
      timeSaved: "15h/vecka",
      implementation: "2 veckor: Vecka 1 - Setup & integration. Vecka 2 - Testing & träning",
      roi: "45,000kr/månad"
    },
    {
      title: "AI-genererade säljmejl",
      problem: "100+ cold emails per vecka tar enormt med tid att personalisera",
      solution: "Använd GPT-4 för att generera hyperpersonaliserade outreach-mejl baserat på prospektdata från LinkedIn och företagshemsidor.",
      tools: ["Jasper.ai", "Copy.ai", "Lavender.ai"],
      timeSaved: "10h/vecka",
      implementation: "1 vecka: 3 dagar setup, 4 dagar A/B-testing",
      roi: "30,000kr/månad"
    },
    {
      title: "Automatiska offerter & förslag",
      problem: "Varje anpassad offert tar 2-3 timmar att skapa",
      solution: "Bygg AI-driven offertgenerator som skapar anpassade förslag baserat på kunddata och tidigare vinnande deals.",
      tools: ["PandaDoc AI", "Proposify", "Custom GPT"],
      timeSaved: "8h/vecka",
      implementation: "3 veckor: Analysera vinnande förslag → Bygg templates → Träna AI",
      roi: "24,000kr/månad"
    },
    {
      title: "Lead scoring med maskininlärning",
      problem: "Säljare slösar tid på okvalificerade leads",
      solution: "Implementera ML-modell som scorer leads baserat på 50+ signaler och prioriterar de mest lovande.",
      tools: ["Leadspace", "6sense", "Clearbit Reveal"],
      timeSaved: "12h/vecka",
      implementation: "4 veckor: Data-analys → Modellträning → Integration → Optimering",
      roi: "36,000kr/månad"
    },
    {
      title: "Samtalsanalys & coaching",
      problem: "Ingen systematisk analys av säljsamtal för förbättring",
      solution: "AI som analyserar alla säljsamtal, ger realtids-coaching och identifierar vinnande mönster.",
      tools: ["Gong.io", "Chorus.ai", "ExecVision"],
      timeSaved: "5h/vecka",
      implementation: "2 veckor: Installation → Baseline → Coaching-program",
      roi: "15,000kr/månad"
    }
  ];

  if (loading) {
    return <LoadingAnalysis />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-40 left-20 w-[30rem] h-[30rem] bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Success header */}
      <div className="relative z-10">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium mb-6 animate-bounce-slow">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Analys klar!</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                Er AI-Strategi är Klar
              </h1>
              <p className="text-xl text-gray-600 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                5 konkreta lösningar som kan spara ert team <span className="font-bold text-gray-900">{totalTimeSaved}</span>
              </p>

              {/* Key metrics - more visual */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 transform hover:scale-105 transition-all animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="text-5xl mb-4">⏱️</div>
                  <p className="text-gray-500 text-sm mb-2">Total tidsbesparing</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{totalTimeSaved}</p>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 transform hover:scale-105 transition-all animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="text-5xl mb-4">💰</div>
                  <p className="text-gray-500 text-sm mb-2">Beräknad ROI per år</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{totalROI}</p>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 transform hover:scale-105 transition-all animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="text-5xl mb-4">🚀</div>
                  <p className="text-gray-500 text-sm mb-2">AI-lösningar</p>
                  <p className="text-4xl font-bold text-gray-900">{solutions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solutions - interactive cards */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-6">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className={`bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl animate-fade-in-up ${
                  expandedCard === index ? 'ring-2 ring-gray-900' : ''
                }`}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div
                  className="p-8 cursor-pointer"
                  onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {solution.title}
                          </h3>
                          <p className="text-gray-600">
                            {solution.problem}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 ml-6">
                      <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium">
                        Sparar {solution.timeSaved}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        ROI: {solution.roi}
                      </div>
                      <svg className={`w-6 h-6 text-gray-400 transform transition-transform ${expandedCard === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {expandedCard === index && (
                    <div className="mt-8 pt-8 border-t border-gray-100 space-y-8 animate-fade-in">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-2xl">💡</span>
                          Lösning
                        </h4>
                        <p className="text-gray-700 leading-relaxed">{solution.solution}</p>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="text-2xl">🛠️</span>
                          Rekommenderade verktyg
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {solution.tools.map((tool, i) => (
                            <div
                              key={i}
                              className="px-5 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all transform hover:scale-105 cursor-pointer"
                            >
                              {tool}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-2xl">📅</span>
                          Implementation
                        </h4>
                        <p className="text-gray-700">{solution.implementation}</p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                        <p className="text-blue-900 font-medium">
                          💡 <strong>Pro-tips:</strong> Börja med en pilot på 2-3 personer. Mät resultat noggrant första månaden. 
                          Skala upp gradvis baserat på faktisk ROI.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Premium CTA - redesigned */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-3xl opacity-20 animate-pulse-slow" />
            <div className="relative bg-gray-900 text-white rounded-3xl p-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4">
                    Vill ni ha en komplett implementeringsplan?
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Få allt ni behöver för att lyckas med er AI-transformation. 
                    Detaljerad plan, training, support och garanterad ROI.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  {[
                    {
                      icon: "📋",
                      title: "Komplett paket",
                      items: ["12-veckors plan", "Team training", "Change management", "ROI-tracking"]
                    },
                    {
                      icon: "🤝",
                      title: "Dedikerad support",
                      items: ["30 dagars email", "Onboarding workshop", "Kvartalsvis uppföljning", "Alla uppdateringar"]
                    },
                    {
                      icon: "🎯",
                      title: "Garanterade resultat",
                      items: ["20-50h/vecka sparade", "30% högre produktivitet", "ROI inom 90 dagar", "Nöjd-garanti"]
                    }
                  ].map((section, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="text-4xl mb-4">{section.icon}</div>
                      <h3 className="font-bold text-xl mb-4">{section.title}</h3>
                      <ul className="space-y-2">
                        {section.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-gray-300">
                            <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Team Premium</div>
                    <div className="text-5xl font-bold">99€</div>
                    <div className="text-sm text-gray-400">engångsbetalning</div>
                  </div>
                  <button
                    onClick={() => router.push("/business/checkout")}
                    className="group px-10 py-5 bg-white text-gray-900 rounded-2xl hover:bg-gray-100 transition-all font-bold text-xl transform hover:scale-105 hover:shadow-2xl"
                  >
                    <span className="flex items-center gap-3">
                      Köp Team Premium
                      <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>

                <p className="text-center text-gray-400 text-sm mt-8">
                  🔒 Säker betalning med Stripe • 30 dagars pengarna-tillbaka-garanti
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/business")}
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-gray-400 transition-all font-medium transform hover:scale-105"
            >
              Gör en ny analys
            </button>
            <button
              onClick={() => window.print()}
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-gray-400 transition-all font-medium transform hover:scale-105 flex items-center gap-2 justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Skriv ut rapport
            </button>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </main>
  );
}