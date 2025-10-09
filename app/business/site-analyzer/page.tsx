"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessSiteAnalyzer() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [dept, setDept] = useState("");
  const [loading, setLoading] = useState(false);
  
  const departments = [
    "Försäljning","Marknad","HR","Ekonomi","Kundtjänst","Drift","IT","Inköp","Legal","Ledningsgrupp",
    "Produkt","Support","Reception","Kommunikation","Logistik","Kvalitet","Data & Analytics",
    "UX/UI","Engineering","Compliance"
  ];

  const startAnalysis = async () => {
    if (!url || !dept) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/business/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await resp.json();
      sessionStorage.setItem("companyAnalysis", JSON.stringify({ 
        url, 
        dept, 
        content: data.content || "",
        summary: data.summary || {}
      }));
      router.push("/business/site-analyzer/results");
    } catch (error) {
      console.error("Scraping failed:", error);
      alert("Kunde inte analysera företagets webbplats. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-20 sm:pt-24">
        <div className="space-y-12 max-w-4xl mx-auto w-full">
          {/* Hero section */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl opacity-75 group-hover:opacity-100 blur-sm transition duration-1000 group-hover:duration-200 animate-gradient-x overflow-hidden"></div>
            
            <div className="relative bg-white rounded-2xl p-8 sm:p-12">
              <div className="text-center animate-fade-in-up">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-wider uppercase">
                  AI för företag
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light px-4 sm:px-8 tracking-wide max-w-3xl mx-auto">
                  Analysera din webbplats – få tre skräddarsydda AI-prompts för din avdelning.
                  <br/>
                  <span className="text-base sm:text-lg">Spara tid. Öka effektiviteten. Imponera ledningen.</span>
                </p>
              </div>
              
              <div className="mt-12 space-y-6">
                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Företagets webbplats
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://dittforetag.se"
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white border-2 border-gray-900 rounded-xl sm:rounded-2xl focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 placeholder-gray-500 font-medium"
                  />
                </div>

                {/* Department Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Välj avdelning
                  </label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white border-2 border-gray-900 rounded-xl sm:rounded-2xl focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    <option value="">Välj avdelning...</option>
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  onClick={startAnalysis}
                  disabled={!url || !dept || loading}
                  className={`w-full py-3 sm:py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl font-medium transition-all duration-200 ${
                    !url || !dept || loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-95 shadow-md"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                      Analyserar webbplats...
                    </span>
                  ) : (
                    "Analysera och skapa AI-prompts"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="mt-16 animate-fade-in-up max-w-2xl mx-auto" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Så fungerar det</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  1
                </div>
                <p className="text-base text-gray-700 pt-2">
                  <span className="font-semibold">Ange URL</span> – vi analyserar upp till 20 sidor från er webbplats automatiskt.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  2
                </div>
                <p className="text-base text-gray-700 pt-2">
                  <span className="font-semibold">Välj avdelning</span> – AI förstår er bransch och avdelningens utmaningar.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  3
                </div>
                <p className="text-base text-gray-700 pt-2">
                  <span className="font-semibold">Få tre AI-prompts</span> – specifika för ert företag och avdelning, redo att använda direkt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
