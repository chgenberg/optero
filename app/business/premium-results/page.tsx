"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatCoach from "@/components/ChatCoach";

export default function BusinessPremiumResultsPage() {
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);
  const [businessData, setBusinessData] = useState<any>({});
  const [businessTier, setBusinessTier] = useState<string>("");
  
  // Check if user has access and get data
  useEffect(() => {
    const hasPurchased = sessionStorage.getItem("businessPremiumPurchased");
    if (!hasPurchased) {
      router.push("/business");
      return;
    }
    
    // Get business data from session
    const data = JSON.parse(sessionStorage.getItem("businessAnalysis") || "{}");
    setBusinessData(data);
    
    // Get tier
    const tier = sessionStorage.getItem("businessTier") || "starter";
    setBusinessTier(tier);
  }, [router]);

  const hasFullAccess = businessTier === "growth";

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-40 right-20 w-[30rem] h-[30rem] bg-green-200 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Success header */}
      <div className="relative z-10">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium mb-6">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{hasFullAccess ? "Growth-analys klar!" : "Starter-analys klar!"}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Er AI-Strategi är Klar
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {hasFullAccess 
                  ? "Här är er kompletta 12-veckors implementeringsplan med allt ni behöver"
                  : "Här är er grundläggande AI-strategi för att komma igång"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Implementation timeline */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <span className="text-3xl">📅</span>
                  {hasFullAccess ? "12-veckors Implementeringsplan" : "4-veckors Snabbstart"}
                </h2>
                
                {!hasFullAccess && (
                  <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-yellow-800 text-sm">
                      🔒 Uppgradera till Growth för full 12-veckors plan med detaljerade milstolpar
                    </p>
                  </div>
                )}
                
                <div className="space-y-6">
                  {(hasFullAccess ? [
                    { phase: "Fas 1: Foundation (Vecka 1-3)", tasks: ["AI-verktyg setup", "Team training", "Pilot med 2-3 personer"] },
                    { phase: "Fas 2: Expansion (Vecka 4-7)", tasks: ["Utöka till hela teamet", "Första mätningar", "Justera processer"] },
                    { phase: "Fas 3: Optimering (Vecka 8-11)", tasks: ["Finjustera workflows", "Automatisera mer", "ROI-analys"] },
                    { phase: "Fas 4: Skalning (Vecka 12+)", tasks: ["Dokumentera best practices", "Sprida till andra avdelningar", "Långsiktig strategi"] }
                  ] : [
                    { phase: "Vecka 1-2: Quick Start", tasks: ["Välj 1-2 AI-verktyg", "Testa med en person"] },
                    { phase: "Vecka 3-4: Utvärdering", tasks: ["Mät första resultat", "Besluta om fortsättning"] }
                  ]).map((phase, i) => (
                    <div key={i} className="relative pl-8 pb-8 border-l-2 border-gray-200 last:border-0">
                      <div className="absolute -left-3 top-0 w-6 h-6 bg-gray-900 rounded-full" />
                      <h3 className="font-bold text-lg text-gray-900 mb-3">{phase.phase}</h3>
                      <ul className="space-y-2">
                        {phase.tasks.map((task, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {hasFullAccess && (
                <section className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <span className="text-3xl">🎓</span>
                    Team Training Material
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { title: "AI Grundkurs", duration: "2h", content: "Förstå AI, promptteknik, säkerhet" },
                      { title: "Verktygsworkshop", duration: "3h", content: "Hands-on med era AI-verktyg" },
                      { title: "Process-integration", duration: "2h", content: "Integrera AI i befintliga workflows" },
                      { title: "Best Practices", duration: "1h", content: "Tips, tricks och vanliga misstag" }
                    ].map((training, i) => (
                      <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900">{training.title}</h3>
                          <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs">{training.duration}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{training.content}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar with resources */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  ROI Dashboard
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-gray-600">Förväntad tidsbesparing</p>
                    <p className="text-2xl font-bold text-green-600">20-50h/vecka</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-gray-600">Break-even</p>
                    <p className="text-2xl font-bold text-blue-600">{"< 1 månad"}</p>
                  </div>
                </div>
              </div>

              {hasFullAccess ? (
                <>
                  <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">📚</span>
                      Resurser
                    </h3>
                    <ul className="space-y-3">
                      <li>
                        <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Change Management Guide
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          KPI Tracking Template
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Playbook PDF (30+ sidor)
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-3xl p-6">
                    <h3 className="font-bold text-lg mb-2">Behöver hjälp?</h3>
                    <p className="text-sm opacity-90 mb-4">
                      Er dedikerade support är här för er i 30 dagar
                    </p>
                    <button className="w-full bg-white text-gray-900 rounded-xl py-3 font-medium hover:bg-gray-100 transition-colors">
                      Kontakta support
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-gray-900 text-white rounded-3xl p-6">
                  <h3 className="font-bold text-lg mb-4">Uppgradera till Growth</h3>
                  <ul className="space-y-2 text-sm mb-6">
                    <li className="flex items-start gap-2">
                      <span>✅</span>
                      <span>Full 12-veckors plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>✅</span>
                      <span>Team training material</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>✅</span>
                      <span>30 dagars support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>✅</span>
                      <span>Alla mallar & guider</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => router.push("/business/checkout")}
                    className="w-full bg-white text-gray-900 rounded-xl py-3 font-medium hover:bg-gray-100 transition-colors"
                  >
                    Uppgradera nu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Coach Button - only for Growth tier */}
      {!showChat && hasFullAccess && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-8 right-8 bg-gray-900 text-white rounded-full p-4 shadow-2xl hover:bg-gray-800 transition-all transform hover:scale-110 group"
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <span className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            AI Implementation Coach
          </span>
        </button>
      )}

      {/* AI Coach Chat */}
      {showChat && hasFullAccess && (
        <ChatCoach
          userContext={{
            type: "business",
            department: businessData.dept,
            companySize: businessData.size,
            challenges: Object.values(businessData.answers || {})
          }}
          onClose={() => setShowChat(false)}
        />
      )}
    </main>
  );
}