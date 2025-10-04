"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type TabType = "overview" | "tools" | "implementation" | "examples" | "pdf";

interface PremiumResult {
  overview: {
    summary: string;
    keyInsights: string[];
    timeSavings: string;
    quickWins: string[];
  };
  detailedTools: Array<{
    name: string;
    description: string;
    specificUseCase: string;
    setupGuide: string[];
    prompts: string[];
    roi: string;
  }>;
  implementation: {
    week1: string[];
    week2: string[];
    week3: string[];
    week4: string[];
    longTerm: string[];
  };
  examples: Array<{
    scenario: string;
    before: string;
    after: string;
    timeSaved: string;
    toolsUsed: string[];
  }>;
}

export default function PremiumResultsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [results, setResults] = useState<PremiumResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    generateResults();
  }, []);

  const generateResults = async () => {
    setLoading(true);
    setGenerating(true);

    try {
      const context = sessionStorage.getItem("premiumContext");
      const answers = sessionStorage.getItem("premiumAnswers");

      if (!context || !answers) {
        router.push("/");
        return;
      }

      const response = await fetch("/api/premium/generate-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: JSON.parse(context),
          answers: JSON.parse(answers),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Failed to generate results:", error);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const downloadPdf = async () => {
    setGeneratingPdf(true);
    
    // In real app, this would generate a proper PDF
    // For now, simulate PDF generation
    setTimeout(() => {
      alert("PDF genereras och skickas till din email!");
      setGeneratingPdf(false);
    }, 2000);
  };

  if (loading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-gray-600">
            {generating ? "Analyserar dina svar och skapar din personliga guide..." : "Laddar..."}
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as TabType, label: "Översikt", icon: "📊" },
    { id: "tools" as TabType, label: "AI-verktyg", icon: "🛠️" },
    { id: "implementation" as TabType, label: "Implementering", icon: "📅" },
    { id: "examples" as TabType, label: "Exempel", icon: "💡" },
    { id: "pdf" as TabType, label: "PDF-guide", icon: "📄" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Premium header */}
      <div className="bg-gray-900 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                Din personliga AI-guide
              </h1>
              <p className="text-gray-300">
                Skräddarsydd för din roll och dina behov
              </p>
            </div>
            <button
              onClick={downloadPdf}
              disabled={generatingPdf}
              className="btn-secondary bg-white text-gray-900 hover:bg-gray-100"
            >
              {generatingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Genererar PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ladda ner PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sammanfattning</h2>
              <p className="text-gray-700 leading-relaxed">{results.overview.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Viktiga insikter</h3>
                <ul className="space-y-3">
                  {results.overview.keyInsights.map((insight, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">⚡ Quick wins</h3>
                <ul className="space-y-3">
                  {results.overview.quickWins.map((win, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-blue-500 mr-2">→</span>
                      <span className="text-gray-700">{win}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Beräknad tidsbesparing
                </h3>
                <p className="text-4xl font-bold text-green-600">
                  {results.overview.timeSavings}
                </p>
                <p className="text-gray-600 mt-2">per vecka med full implementation</p>
              </div>
            </div>
          </div>
        )}

        {/* Tools tab */}
        {activeTab === "tools" && (
          <div className="space-y-6 animate-fade-in-up">
            {results.detailedTools.map((tool, index) => (
              <div key={index} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{tool.name}</h3>
                    <p className="text-gray-600 mt-1">{tool.description}</p>
                  </div>
                  <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    {tool.roi}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Din specifika användning:</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{tool.specificUseCase}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Steg-för-steg guide:</h4>
                    <ol className="space-y-2">
                      {tool.setupGuide.map((step, i) => (
                        <li key={i} className="flex">
                          <span className="text-gray-400 mr-3">{i + 1}.</span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Färdiga prompts att kopiera:</h4>
                    <div className="space-y-2">
                      {tool.prompts.map((prompt, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg font-mono text-sm text-gray-700">
                          {prompt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Implementation tab */}
        {activeTab === "implementation" && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Din 4-veckors implementeringsplan
              </h2>

              <div className="space-y-6">
                {Object.entries(results.implementation).map(([week, tasks]) => (
                  <div key={week} className="border-l-4 border-gray-900 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {week === "longTerm" ? "Långsiktiga mål" : week.replace("week", "Vecka ")}
                    </h3>
                    <ul className="space-y-2">
                      {(tasks as string[]).map((task, i) => (
                        <li key={i} className="flex items-start">
                          <input type="checkbox" className="mr-3 mt-1" />
                          <span className="text-gray-700">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Examples tab */}
        {activeTab === "examples" && (
          <div className="space-y-6 animate-fade-in-up">
            {results.examples.map((example, index) => (
              <div key={index} className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{example.scenario}</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">❌ Före AI</h4>
                    <p className="text-gray-700">{example.before}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">✅ Efter AI</h4>
                    <p className="text-gray-700">{example.after}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {example.toolsUsed.map((tool, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                  <span className="text-green-600 font-semibold">
                    Sparar {example.timeSaved}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PDF tab */}
        {activeTab === "pdf" && (
          <div className="text-center py-12 animate-fade-in-up">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Din kompletta AI-guide som PDF
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Få hela din personliga guide som en snygg PDF du kan skriva ut, 
              spara eller dela med kollegor. Innehåller allt från denna sida plus 
              extra bonusmaterial.
            </p>

            <button
              onClick={downloadPdf}
              disabled={generatingPdf}
              className="btn-primary text-lg px-8 py-4"
            >
              {generatingPdf ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Genererar din PDF...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ladda ner PDF (28 sidor)
                </>
              )}
            </button>

            <p className="text-sm text-gray-500 mt-4">
              PDF:en skickas också till din email
            </p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 mb-4">
            Behöver du hjälp att komma igång? Har du frågor om implementeringen?
          </p>
          <a
            href="mailto:support@optero.se"
            className="inline-flex items-center gap-2 text-gray-900 font-medium hover:underline"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Kontakta oss för support
          </a>
        </div>
      </div>
    </div>
  );
}
