"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnalyzeProblem() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [selectedProblem, setSelectedProblem] = useState("");

  useEffect(() => {
    const analyzeWebsite = async () => {
      const url = sessionStorage.getItem("botWebsiteUrl");
      if (!url) {
        router.push("/business/bot-builder/identify");
        return;
      }

      try {
        // Use deep-scrape instead of basic scrape
        const res = await fetch("/api/business/deep-scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        
        const data = await res.json();
        setResult(data);
        
        // Store comprehensive analysis
        try { 
          sessionStorage.setItem("botDeepAnalysis", JSON.stringify(data)); 
          sessionStorage.setItem("botBuilder_scrape", JSON.stringify(data)); // legacy compat
        } catch {}
      } catch (error) {
        console.error("Analysis error:", error);
      } finally {
        setAnalyzing(false);
      }
    };

    analyzeWebsite();
  }, [router]);

  const botTypes = [
    {
      id: "knowledge",
      type: "knowledge",
      title: "FAQ & Kunskap",
      description: "Svara på vanliga frågor från din webbplats och dokument",
      metric: "24/7 tillgänglighet",
      icon: "📚",
      complexity: 1,
      useCases: ["FAQ", "Produktinfo", "Onboarding", "Dokumentation"]
    },
    {
      id: "lead-qualification",
      type: "lead",
      title: "Leadkvalificering",
      description: "Kvalificera besökare och samla in kontaktinformation",
      metric: "3x fler kvalificerade leads",
      icon: "🎯",
      complexity: 2,
      useCases: ["B2B SaaS", "Konsultförsäljning", "Demo-bokningar"]
    },
    {
      id: "booking",
      type: "workflow",
      title: "Bokning & Schemaläggning",
      description: "Automatisera bokningar och minska administrativ tid",
      metric: "Spara 2h/dag",
      icon: "📅",
      complexity: 2,
      useCases: ["Frisör", "Tandläkare", "Konsultmöten", "Restaurang"]
    },
    {
      id: "customer-support",
      type: "support",
      title: "Kundsupport (Tier 1)",
      description: "Hantera vanliga supportärenden och skapa tickets",
      metric: "60% färre tickets",
      icon: "💬",
      complexity: 2,
      useCases: ["E-commerce", "SaaS", "IT-support"]
    },
    {
      id: "ecommerce",
      type: "workflow",
      title: "E-commerce Assistant",
      description: "Produktrekommendationer, order tracking, kundvagn",
      metric: "25% högre konvertering",
      icon: "🛒",
      complexity: 3,
      useCases: ["Webshop", "Shopify", "WooCommerce"]
    },
    {
      id: "hr-recruitment",
      type: "workflow",
      title: "HR & Recruitment",
      description: "Screena kandidater och boka intervjuer",
      metric: "5x snabbare screening",
      icon: "👥",
      complexity: 2,
      useCases: ["Rekrytering", "Onboarding", "HR-frågor"]
    },
    {
      id: "sales-assistant",
      type: "lead",
      title: "Sales Assistant (Advanced)",
      description: "Komplex produktkonfigurator med dynamisk prissättning",
      metric: "Custom lösning",
      icon: "💼",
      complexity: 4,
      useCases: ["Enterprise B2B", "CPQ", "Komplex försäljning"],
      requiresCustom: true
    },
    {
      id: "financial-advisor",
      type: "knowledge",
      title: "Finansiell Rådgivning",
      description: "Personaliserade investeringsråd och riskvärdering",
      metric: "Compliance-säker",
      icon: "💰",
      complexity: 5,
      useCases: ["Bank", "Försäkring", "Investering"],
      requiresCustom: true
    }
  ];

  const handleContinue = () => {
    if (!selectedProblem) return;
    
    const botType = botTypes.find(p => p.id === selectedProblem);
    
    // If requires custom, show enterprise modal
    if (botType?.requiresCustom) {
      router.push(`/business/bot-builder/enterprise?type=${selectedProblem}`);
      return;
    }
    
    sessionStorage.setItem("botProblemData", JSON.stringify({
      problem: selectedProblem,
      botType: botType?.type,
      details: botType
    }));
    router.push("/business/bot-builder/interview");
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="minimal-box max-w-md w-full text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 mb-3">Analyserar din webbplats djupgående...</p>
          <p className="text-sm text-gray-500">
            Vi crawlar sidor, extraherar innehåll och identifierar problem med AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        <div className="minimal-box">
          <h2 className="text-2xl font-light text-gray-900 mb-2">
            Vad vill du lösa?
          </h2>
          <p className="text-gray-600 mb-4">
            Baserat på din webbplats har vi identifierat några områden där en chatbot kan göra störst skillnad
          </p>
          
          {/* Show AI insights if available */}
          {result?.analysis && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm font-medium text-blue-900 mb-2">🔍 AI-insikter från din webbplats:</p>
              <p className="text-sm text-blue-800">
                {result.analysis.description || 'Analyserar...'}
              </p>
              {result.analysis.recommendedBotType && (
                <p className="text-xs text-blue-700 mt-2">
                  💡 Rekommenderat: <strong>{result.analysis.recommendedBotType}</strong>
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            {botTypes.map((bot) => (
              <button
                key={bot.id}
                onClick={() => setSelectedProblem(bot.id)}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                  selectedProblem === bot.id
                    ? "border-black bg-gray-50"
                    : bot.requiresCustom
                    ? "border-yellow-300 bg-yellow-50 hover:border-yellow-400"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{bot.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {bot.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {bot.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {bot.useCases.map((uc, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            {uc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {bot.metric}
                    </div>
                    {bot.requiresCustom && (
                      <div className="text-xs text-yellow-700 mt-1 font-medium">
                        Kräver konsultation
                      </div>
                    )}
                  </div>
                </div>
                
                {bot.requiresCustom && (
                  <div className="mt-3 pt-3 border-t border-yellow-200 text-sm text-yellow-800">
                    💡 Detta use case kräver compliance-granskning och custom integrationer
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <button
              onClick={handleContinue}
              disabled={!selectedProblem}
              className="btn-minimal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Fortsätt
            </button>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/business/bot-builder/identify")}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}
