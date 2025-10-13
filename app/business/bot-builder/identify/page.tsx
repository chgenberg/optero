"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IdentifyProblem() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    
    setAnalyzing(true);
    try {
      // Store URL in session
      sessionStorage.setItem("botBuilder_url", url);
      
      // Navigate to problem analysis
      router.push("/business/bot-builder/analyze");
    } catch (error) {
      console.error("Error:", error);
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {/* Progress indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        <div className="minimal-box">
          <h2 className="text-2xl font-light text-gray-900 mb-8">
            Låt oss börja med din webbplats
          </h2>
          
          <div className="space-y-6">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://dinwebbplats.se"
              className="w-full px-6 py-4 bg-gray-50 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            
            <p className="text-sm text-gray-600 text-center">
              Vi analyserar din webbplats för att förstå ditt företag och identifiera områden där en chatbot kan hjälpa
            </p>

            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={!url.trim() || analyzing}
                className="btn-minimal disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? "Analyserar..." : "Fortsätt"}
              </button>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/business/bot-builder")}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}
