"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEPARTMENTS = [
  { value: "sales", label: "Försäljning" },
  { value: "marketing", label: "Marknadsföring" },
  { value: "finance", label: "Ekonomi & Finans" },
  { value: "hr", label: "HR & Personal" },
  { value: "customer-service", label: "Kundtjänst" },
  { value: "operations", label: "Operations" },
  { value: "it", label: "IT & Teknik" },
  { value: "management", label: "Ledning" },
];

export default function BusinessPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [challenge, setChallenge] = useState("");
  const [tools, setTools] = useState("");

  const handleInitialSubmit = () => {
    if (!url || !department) {
      alert("Fyll i webbplats och avdelning");
      return;
    }
    setShowFollowUp(true);
  };

  const startAnalysis = async () => {
    setShowFollowUp(false);
    setLoading(true);
    setProgress(0);
    setLoadingMessage("Förbereder analys...");
    
    // Smooth progress animation over ~2.5 min
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return p + (100 / 150); // 150s = 2.5 min
      });
    }, 1000);

    try {
      const normalizeUrl = (u: string) => {
        const trim = (u || "").trim();
        try { return new URL(trim).toString(); } catch {}
        try { return new URL(`https://${trim}`).toString(); } catch {}
        return `https://${trim}`;
      };
      const targetUrl = normalizeUrl(url);
      // 1) Scrape
      setLoadingMessage("Skrapar företagets webbplats...");
      const scrape = await fetch("/api/business/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl })
      });
      const scraped = await scrape.json();

      // 2) Bygg CompanyProfile och föreslagna avdelningar
      setLoadingMessage("Analyserar företagsprofil...");
      let chosenDept = department;
      try {
        const profRes = await fetch("/api/business/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl, scrape: scraped })
        });
        const prof = await profRes.json();
        sessionStorage.setItem("companyProfile", JSON.stringify(prof));
        if (!chosenDept && Array.isArray(prof.recommendedDepartments) && prof.recommendedDepartments.length > 0) {
          chosenDept = prof.recommendedDepartments[0].dept || chosenDept;
          setDepartment(chosenDept);
        }
      } catch {}

      // 3) Generate prompts
      setLoadingMessage("Genererar AI-prompts med GPT-5...");
      const gen = await fetch("/api/business/generate-company-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass entire scrape payload + follow-up context
        body: JSON.stringify({ 
          url: targetUrl, 
          department: chosenDept || department, 
          content: JSON.stringify(scraped),
          challenge,
          tools
        })
      });
      const data = await gen.json();

      // 4) Save and go
      clearInterval(progressInterval);
      setProgress(100);
      setLoadingMessage("Klart!");
      sessionStorage.setItem("companyPromptResults", JSON.stringify({ url: targetUrl, department: chosenDept || department, solutions: data.solutions || [] }));
      router.push("/business/prompt-results");
    } catch (e) {
      console.error(e);
      clearInterval(progressInterval);
      alert("Kunde inte genomföra analysen. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-20 sm:pt-24 pb-24">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 uppercase tracking-tight">AI för företag</h1>
          <p className="text-lg text-gray-600">Ange webbplats och avdelning – få 3 skräddarsydda AI‑prompts</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {loadingMessage || "Genererar..."}
              </h3>
              <p className="text-sm text-gray-500">
                Detta kan ta upp till 2,5 minuter för bästa resultat
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-gray-200">
                <div
                  className="bg-gray-700 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-600">
                {Math.round(progress)}%
              </p>
            </div>

            {/* Time estimate */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Beräknad tid kvar: {Math.max(0, Math.ceil((100 - progress) * 1.5 / 60))} minuter
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-xl space-y-8 relative overflow-hidden">
          {/* Animated blue border effect */}
          <div className="absolute inset-0 rounded-3xl">
            <div className="absolute inset-0 rounded-3xl animate-pulse-blue"></div>
          </div>
          
          <div className="relative z-10 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Webbplats</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://dittforetag.se"
              className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-900 rounded-2xl focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 placeholder-gray-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Avdelning</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDepartment(d.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    department === d.value 
                      ? 'border-gray-900 bg-gray-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium text-gray-900">{d.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{d.value}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleInitialSubmit}
            disabled={!url || !department || loading}
            className={`w-full py-4 rounded-2xl font-semibold transition-all duration-200 ${
              !url || !department || loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-md'
            }`}
          >
            Fortsätt
          </button>
          </div>
        </div>
        )}

        {/* Follow-up Modal */}
        {showFollowUp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
              {/* Animated blue border */}
              <div className="absolute inset-0 rounded-3xl">
                <div className="absolute inset-0 rounded-3xl animate-pulse-blue"></div>
              </div>

              <div className="relative z-10 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 text-center">Några snabba frågor</h2>
                <p className="text-sm text-gray-600 text-center">Detta ger betydligt bättre resultat</p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Vad är er största utmaning inom {DEPARTMENTS.find(d => d.value === department)?.label || department} just nu?
                  </label>
                  <textarea
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    placeholder="T.ex. svårt att nå nya kunder, låg konvertering, långsam process..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-gray-50 transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Vilka verktyg/system använder ni idag? (valfritt)
                  </label>
                  <input
                    type="text"
                    value={tools}
                    onChange={(e) => setTools(e.target.value)}
                    placeholder="T.ex. HubSpot, Excel, Google Analytics..."
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-gray-50 transition-all duration-200"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFollowUp(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                  >
                    Tillbaka
                  </button>
                  <button
                    onClick={startAnalysis}
                    disabled={!challenge.trim()}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      !challenge.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md'
                    }`}
                  >
                    Generera prompts
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes pulse-blue {
          0%, 100% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3); }
        }
      `}</style>
    </main>
  );
}