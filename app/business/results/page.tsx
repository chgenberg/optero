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
        setSolutions(result.solutions || []);
        setTotalTimeSaved(result.totalTimeSaved || "20-50h/vecka");
        setTotalROI(result.totalROI || "150,000kr/år");
      }
    } catch (error) {
      console.error("Failed to generate solutions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnalysis />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4">
              ✓ Analys klar
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Er AI-Strategi är Klar
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              5 konkreta lösningar som kan spara ert team {totalTimeSaved}
            </p>

            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-500 text-sm mb-1">Total tidsbesparing</p>
                <p className="text-3xl font-bold text-gray-900">{totalTimeSaved}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-500 text-sm mb-1">Beräknad ROI per år</p>
                <p className="text-3xl font-bold text-green-600">{totalROI}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-500 text-sm mb-1">AI-lösningar</p>
                <p className="text-3xl font-bold text-gray-900">{solutions.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solutions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedCard(expandedCard === index ? null : index)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </span>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {solution.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 ml-11">
                      {solution.problem}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Sparar {solution.timeSaved}
                    </span>
                    <span className="text-sm text-gray-500">
                      ROI: {solution.roi}
                    </span>
                  </div>
                </div>

                {expandedCard === index && (
                  <div className="ml-11 mt-6 pt-6 border-t border-gray-100 space-y-6 animate-fade-in">
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Lösning:</p>
                      <p className="text-gray-700">{solution.solution}</p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 mb-2">Rekommenderade verktyg:</p>
                      <div className="flex flex-wrap gap-2">
                        {solution.tools.map((tool, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-900 text-white rounded-full text-sm"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 mb-2">Implementation:</p>
                      <p className="text-gray-700">{solution.implementation}</p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-blue-900 text-sm">
                        <strong>💡 Nästa steg:</strong> Börja med en pilot på 2-3 personer innan ni rullar ut till hela teamet.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA for Team Premium */}
        <div className="mt-12 bg-gray-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vill ni ha en komplett implementeringsplan?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Få en detaljerad 12-veckors plan, team training-material, change management-guide och dedikerad support.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Ingår:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ 12-veckors implementeringsplan</li>
                <li>✓ Team training-material</li>
                <li>✓ Change management-guide</li>
                <li>✓ ROI-tracking dashboard</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Support:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ 30 dagars email-support</li>
                <li>✓ Onboarding-workshop (online)</li>
                <li>✓ Kvartalsvis uppföljning</li>
                <li>✓ Tillgång till alla uppdateringar</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Resultat:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ 20-50h sparade per vecka</li>
                <li>✓ 30% högre produktivitet</li>
                <li>✓ Mätbar ROI inom 90 dagar</li>
                <li>✓ Nöjd-garanti</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Team Premium</div>
              <div className="text-4xl font-bold">99€</div>
              <div className="text-sm text-gray-400">engångsbetalning</div>
            </div>
            <button
              onClick={() => router.push("/business/checkout")}
              className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
            >
              Köp Team Premium
            </button>
          </div>

          <p className="text-gray-400 text-sm mt-6">
            🔒 Säker betalning med Stripe • 30 dagars pengarna-tillbaka-garanti
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/business")}
            className="btn-secondary"
          >
            Gör en ny analys
          </button>
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-2 justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Skriv ut rapport
          </button>
        </div>
      </div>
    </main>
  );
}
