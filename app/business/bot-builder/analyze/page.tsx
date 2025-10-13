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
        const res = await fetch("/api/business/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        
        const data = await res.json();
        setResult(data);
        try { sessionStorage.setItem("botBuilder_scrape", JSON.stringify(data)); } catch {}
      } catch (error) {
        console.error("Analysis error:", error);
      } finally {
        setAnalyzing(false);
      }
    };

    analyzeWebsite();
  }, [router]);

  const problems = [
    {
      id: "lead-qualification",
      title: "Leadkvalificering",
      description: "Många besökare lämnar utan att konvertera",
      metric: "65% bounce rate"
    },
    {
      id: "customer-support",
      title: "Kundsupport",
      description: "Återkommande frågor tar tid från teamet",
      metric: "40% av tiden på samma frågor"
    },
    {
      id: "booking",
      title: "Bokning & schemaläggning",
      description: "Manuell hantering av bokningar",
      metric: "2h/dag på administration"
    }
  ];

  const handleContinue = () => {
    if (!selectedProblem) return;
    
    const problem = problems.find(p => p.id === selectedProblem);
    sessionStorage.setItem("botProblemData", JSON.stringify({
      problem: selectedProblem,
      details: problem
    }));
    router.push("/business/bot-builder/interview");
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="minimal-box max-w-md w-full text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600">Analyserar din webbplats...</p>
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
          <p className="text-gray-600 mb-10">
            Baserat på din webbplats har vi identifierat några områden där en chatbot kan göra störst skillnad
          </p>

          <div className="space-y-4">
            {problems.map((problem) => (
              <button
                key={problem.id}
                onClick={() => setSelectedProblem(problem.id)}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                  selectedProblem === problem.id
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {problem.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {problem.description}
                    </p>
                  </div>
                  <div className="text-sm font-mono text-gray-500">
                    {problem.metric}
                  </div>
                </div>
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
