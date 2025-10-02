"use client";

import { useState } from "react";

export default function HackathonDemo() {
  const [step, setStep] = useState<"input" | "generating" | "results">("input");
  const [industry, setIndustry] = useState("");
  const [challenge, setChallenge] = useState("");
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!industry || !challenge) {
      alert("Fyll i både bransch och utmaning!");
      return;
    }

    setStep("generating");

    try {
      const response = await fetch("/api/hackathon-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, challenge }),
      });

      const data = await response.json();
      setResults(data);
      setStep("results");
    } catch (error) {
      console.error("Error:", error);
      alert("Något gick fel. Försök igen!");
      setStep("input");
    }
  };

  const handleReset = () => {
    setStep("input");
    setIndustry("");
    setChallenge("");
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/Optero_logo.png" alt="Optero" className="h-8" />
            <span className="text-xs text-gray-400">×</span>
            <span className="text-sm font-semibold text-gray-700">FSK GROUP</span>
          </div>
          <div className="text-sm text-gray-500">
            AI Hackathon Demo
          </div>
        </div>
      </div>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-gray-100 border border-gray-300 rounded-full mb-6">
              <span className="text-gray-700 text-sm font-semibold">⚡ LIVE DEMO</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
              AI & LEDARSKAP<br />
              <span className="text-gray-600">
                FRÅN IDÉ TILL HANDLING
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Från utmaning till färdig AI-lösning på <span className="text-black font-bold">30 sekunder</span>
            </p>
            
            <p className="text-sm text-gray-500">
              Presenteras av Christopher Genberg (Optero) & Jon (FSK Group)
            </p>
          </div>

          {/* Input Form */}
          {step === "input" && (
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 lg:p-12 animate-fade-in">
              <div className="space-y-6">
                {/* Industry selector */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-900">
                    1. VÄLJ ER BRANSCH/OMRÅDE
                  </label>
                  <div className="relative">
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-2xl focus:border-gray-900 focus:outline-none text-gray-900 text-lg transition-all appearance-none cursor-pointer hover:border-gray-400"
                    >
                      <option value="">-- Välj bransch --</option>
                      <option value="Rekrytering & Talent Acquisition">Rekrytering & Talent Acquisition</option>
                      <option value="HR & People Development">HR & People Development</option>
                      <option value="Employer Branding">Employer Branding</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                      <option value="Management Consulting">Management Consulting</option>
                      <option value="Utbildning & Utveckling">Utbildning & Utveckling</option>
                      <option value="Industri & Tillverkning">Industri & Tillverkning</option>
                      <option value="Retail & E-commerce">Retail & E-commerce</option>
                      <option value="Tech & IT">Tech & IT</option>
                      <option value="Hälsa & Vård">Hälsa & Vård</option>
                    </select>
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Challenge input */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-900">
                    2. BESKRIV ER STÖRSTA UTMANING
                  </label>
                  <textarea
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    rows={6}
                    placeholder="Exempel: Vi spenderar 15h per vecka på att skriva annonser och screena CV:n. Det tar tid från det strategiska arbetet och vi missar ofta bra kandidater som har ovanliga bakgrunder. Vi behöver bli snabbare utan att minska kvaliteten..."
                    className="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-2xl focus:border-gray-900 focus:outline-none text-gray-900 resize-none transition-all placeholder-gray-400 hover:border-gray-400"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Ju mer detaljer, desto bättre lösning!
                    </p>
                    <p className={`text-xs font-semibold ${challenge.split(' ').length < 20 ? 'text-gray-400' : 'text-gray-900'}`}>
                      {challenge.split(' ').filter(w => w.length > 0).length} ord
                    </p>
                  </div>
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={!industry || challenge.split(' ').length < 20}
                  className="w-full py-5 bg-gray-900 text-white font-bold text-lg rounded-2xl hover:bg-black hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transform hover:scale-105 disabled:hover:scale-100"
                >
                  ⚡ GENERERA AI-LÖSNING (30 sek)
                </button>
              </div>
            </div>
          )}

          {/* Generating State */}
          {step === "generating" && (
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-12 text-center animate-fade-in">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 border-4 border-gray-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-24 h-24 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Analyserar er utmaning...</h2>
              <div className="space-y-2 text-gray-600">
                <p className="animate-pulse">⚡ Identifierar affärskritiska problem</p>
                <p className="animate-pulse" style={{ animationDelay: '0.5s' }}>🤖 Matchar AI-verktyg</p>
                <p className="animate-pulse" style={{ animationDelay: '1s' }}>📊 Beräknar ROI och tidsbesparing</p>
                <p className="animate-pulse" style={{ animationDelay: '1.5s' }}>🚀 Skapar implementeringsplan</p>
              </div>
            </div>
          )}

          {/* Results */}
          {step === "results" && results && (
            <div className="space-y-6 animate-fade-in">
              {/* Summary */}
              <div className="bg-gray-900 rounded-3xl p-8 text-white">
                <h2 className="text-3xl font-black mb-4">🎯 ER AI-LÖSNING</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Estimerad tidsbesparing</div>
                    <div className="text-4xl font-black">{results.summary?.timeSaved || "8-12h/vecka"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Värde per månad</div>
                    <div className="text-4xl font-black">{results.summary?.monthlyValue || "45 000 kr"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Implementation</div>
                    <div className="text-4xl font-black">{results.summary?.implementationTime || "1-2 veckor"}</div>
                  </div>
                </div>
              </div>

              {/* Solutions */}
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">🚀 3 Konkreta AI-lösningar</h3>
                <div className="space-y-4">
                  {results.solutions?.map((solution: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-gray-900 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-xl font-bold text-gray-900">{idx + 1}. {solution.name}</h4>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {solution.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{solution.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-xs text-gray-500">Tidsbesparing:</span>
                          <p className="font-semibold text-gray-900">{solution.timeSaved}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Kostnad:</span>
                          <p className="font-semibold text-gray-900">{solution.cost}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-semibold mb-2 text-gray-900">⚡ Testa direkt:</p>
                        <code className="text-xs text-gray-700 block">
                          {solution.quickStart}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Implementation Plan */}
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">📅 Implementeringsplan (30 dagar)</h3>
                <div className="space-y-4">
                  {results.implementationPlan?.map((week: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center">
                        <span className="text-white font-black text-xl">V{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-2 text-gray-900">{week.title}</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {week.tasks?.map((task: string, i: number) => (
                            <li key={i}>✓ {task}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">🎯 Nästa steg för er organisation</h3>
                <div className="space-y-3">
                  {results.nextSteps?.map((step: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{idx + 1}</span>
                      </div>
                      <p className="flex-1 pt-1 text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-2xl font-bold transition-all"
                >
                  ← Testa nytt scenario
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl hover:shadow-xl transition-all"
                >
                  📄 Exportera som PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Powered by <span className="text-gray-900 font-semibold">Optero</span> × <span className="text-gray-700 font-semibold">FSK Group</span></p>
          <p className="mt-2">AI & Ledarskap i Praktiken • Live Demo Session</p>
        </div>
      </div>
    </div>
  );
}

