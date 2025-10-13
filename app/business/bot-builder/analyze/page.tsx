"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Info } from "lucide-react";

export default function AnalyzeProblem() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [selectedBot, setSelectedBot] = useState("");
  const [showInfoFor, setShowInfoFor] = useState<string | null>(null);

  useEffect(() => {
    const analyzeWebsite = async () => {
      const url = sessionStorage.getItem("botWebsiteUrl");
      if (!url) {
        router.push("/business/bot-builder/identify");
        return;
      }

      try {
        const documentContent = sessionStorage.getItem("botDocuments") || "";
        
        const res = await fetch("/api/business/deep-scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            url,
            documentContent
          }),
        });
        
        const data = await res.json();
        setResult(data);
        
        try { 
          sessionStorage.setItem("botDeepAnalysis", JSON.stringify(data)); 
          sessionStorage.setItem("botBuilder_scrape", JSON.stringify(data));
        } catch {}
      } catch (error) {
        console.error("Analysis error:", error);
      } finally {
        // Extended loading for effect
        setTimeout(() => setAnalyzing(false), 3000);
      }
    };

    analyzeWebsite();
  }, [router]);

  const botRecommendations = [
    {
      id: "customer-support",
      title: "KUNDSUPPORT",
      type: "support",
      description: "Automatisera 60% av supportärenden",
      metrics: ["24/7 tillgänglighet", "< 5 sek svarstid", "90% nöjdhet"],
      effort: "5 MIN",
      savings: "120 000 kr/år"
    },
    {
      id: "lead-qualification",
      title: "LEADKVALIFICERING",
      type: "lead",
      description: "Kvalificera och boka möten automatiskt",
      metrics: ["3x fler kvalificerade leads", "Automatisk CRM-synk", "Personaliserat"],
      effort: "10 MIN",
      savings: "250 000 kr/år"
    },
    {
      id: "booking",
      title: "BOKNING",
      type: "workflow",
      description: "Eliminera dubbelbokning och manuell hantering",
      metrics: ["Integrerat med kalender", "SMS-påminnelser", "Automatisk bekräftelse"],
      effort: "15 MIN",
      savings: "80 000 kr/år"
    }
  ];

  const advancedSolutions = [
    {
      title: "PROCESS AUTOMATION",
      description: "Automatisera hela arbetsflöden med AI",
      complexity: "Kräver konsultation"
    },
    {
      title: "KNOWLEDGE MANAGEMENT",
      description: "AI som förstår alla era dokument och processer",
      complexity: "Kräver konsultation"
    },
    {
      title: "PREDICTIVE ANALYTICS",
      description: "Förutse problem innan de uppstår",
      complexity: "Kräver konsultation"
    }
  ];

  const handleContinue = () => {
    if (!selectedBot) return;
    
    const bot = botRecommendations.find(b => b.id === selectedBot);
    sessionStorage.setItem("botProblemData", JSON.stringify({
      problem: selectedBot,
      botType: bot?.type,
      details: bot
    }));
    
    router.push("/business/bot-builder/customize");
  };

  const handleConsultation = () => {
    router.push("/business/bot-builder/enterprise");
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border border-black rounded-full mx-auto mb-8 relative">
            <div className="absolute inset-0 border border-black rounded-full animate-ping" />
          </div>
          <h2 className="text-2xl font-thin uppercase tracking-wider mb-4">
            ANALYSERAR DIN VERKSAMHET
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Vår AI går igenom all information för att identifiera var automation 
            kan göra din verksamhet mer lönsam och effektiv
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[1px] bg-gray-300" />
            <div className="text-xs uppercase tracking-widest">STEG 2</div>
            <div className="w-8 h-[1px] bg-gray-300" />
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-thin uppercase tracking-wider mb-4">
            RESULTAT AV ANALYSEN
          </h1>
          
          {result?.analysis && (
            <div className="mt-8 p-8 bg-gray-50 max-w-2xl mx-auto">
              <p className="text-sm text-gray-800 leading-relaxed">
                {result.analysis.description}
              </p>
              {result.analysis.hiddenOpportunities?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-xs uppercase tracking-widest mb-3">Dolda möjligheter</h3>
                  <ul className="space-y-2 text-left">
                    {result.analysis.hiddenOpportunities.map((opp: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">— {opp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bot Recommendations */}
        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-center mb-8">
            REKOMMENDERADE LÖSNINGAR
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {botRecommendations.map((bot) => (
              <button
                key={bot.id}
                onClick={() => setSelectedBot(bot.id)}
                className={`p-8 border text-left transition-all relative ${
                  selectedBot === bot.id
                    ? "border-black bg-gray-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfoFor(showInfoFor === bot.id ? null : bot.id);
                  }}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
                >
                  <Info className="w-4 h-4" />
                </button>
                
                {showInfoFor === bot.id && (
                  <div className="absolute right-0 top-12 w-64 p-4 bg-white border border-gray-200 shadow-lg z-10">
                    <p className="text-xs text-gray-600">
                      Denna bot kan automatiskt hantera vanliga frågor, skapa supportärenden 
                      och eskalera komplexa ärenden till rätt person.
                    </p>
                  </div>
                )}
                
                <h3 className="text-lg font-thin uppercase tracking-wider mb-2">
                  {bot.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {bot.description}
                </p>
                
                <div className="space-y-1 mb-6">
                  {bot.metrics.map((metric, i) => (
                    <p key={i} className="text-xs text-gray-500">• {metric}</p>
                  ))}
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500">Uppsättning</p>
                    <p className="text-sm font-medium">{bot.effort}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Besparing</p>
                    <p className="text-sm font-medium">{bot.savings}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={handleContinue}
              disabled={!selectedBot}
              className="px-16 py-4 bg-black text-white text-xs uppercase tracking-widest disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-3"
            >
              Bygg vald bot
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Solutions */}
        <div className="border-t border-gray-200 pt-16">
          <h2 className="text-xs uppercase tracking-widest text-center mb-8">
            AVANCERADE LÖSNINGAR
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {advancedSolutions.map((solution, i) => (
              <div key={i} className="p-8 bg-gray-50">
                <h3 className="text-lg font-thin uppercase tracking-wider mb-2">
                  {solution.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {solution.description}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  {solution.complexity}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button
              onClick={handleConsultation}
              className="px-16 py-4 border border-black text-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              Boka konsultation
            </button>
          </div>
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => router.push("/business/bot-builder/identify")}
            className="text-xs text-gray-500 hover:text-black transition-colors"
          >
            Tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}