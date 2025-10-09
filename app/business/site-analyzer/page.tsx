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
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-wide">
                  AI som växer med ditt företag
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light px-4 sm:px-8 tracking-wide max-w-3xl mx-auto">
                  Analysera din webbplats – få tre skräddarsydda AI-prompts för din avdelning.
                  <br/>
                  <span className="text-base sm:text-lg text-gray-500">Spara tid. Öka effektiviteten. Imponera ledningen.</span>
                </p>
              </div>
              
              <div className="mt-12 space-y-6">
                {/* URL Input */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide uppercase">
                    Företagets webbplats
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://dittforetag.se"
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 placeholder-gray-400 font-medium group-hover:border-gray-400"
                    />
                    <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-transparent via-gray-900 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500"></div>
                  </div>
                </div>

                {/* Department Select */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide uppercase">
                    Välj avdelning
                  </label>
                  <div className="relative">
                    <select
                      value={dept}
                      onChange={(e) => setDept(e.target.value)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 font-medium appearance-none cursor-pointer group-hover:border-gray-400"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 1rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '3rem'
                      }}
                    >
                      <option value="">Välj avdelning...</option>
                      {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-transparent via-gray-900 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500"></div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={startAnalysis}
                  disabled={!url || !dept || loading}
                  className={`group relative w-full py-3 sm:py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 overflow-hidden ${
                    !url || !dept || loading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  }`}
                >
                  <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                      Analyserar webbplats...
                    </span>
                  ) : (
                    "Analysera och skapa AI-prompts"
                  )}
                  </span>
                  {!loading && url && dept && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="mt-16 animate-fade-in-up max-w-2xl mx-auto" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Så fungerar det</h2>
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-gray-300 via-gray-300 to-transparent hidden sm:block"></div>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    1
                    <div className="absolute inset-0 bg-gray-900 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-gray-900 mb-1">Ange URL</h3>
                    <p className="text-sm text-gray-600">
                      Vi analyserar upp till 20 sidor från er webbplats automatiskt.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-gray-900 mb-1">Välj avdelning</h3>
                    <p className="text-sm text-gray-600">
                      AI förstår er bransch och avdelningens utmaningar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-gray-900 mb-1">Få tre AI-prompts</h3>
                    <p className="text-sm text-gray-600">
                      Specifika för ert företag och avdelning, redo att använda direkt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
