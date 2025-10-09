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

  const startAnalysis = async () => {
    if (!url || !department) {
      alert("Fyll i webbplats och avdelning");
      return;
    }
    setLoading(true);
    setProgress(10);
    try {
      // 1) Scrape
      setProgress(30);
      const scrape = await fetch("/api/business/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const scraped = await scrape.json();

      // 2) Generate prompts
      setProgress(70);
      const gen = await fetch("/api/business/generate-company-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, department, content: scraped.content || "" })
      });
      const data = await gen.json();

      // 3) Save and go
      setProgress(100);
      sessionStorage.setItem("companyPromptResults", JSON.stringify({ url, department, solutions: data.solutions || [] }));
      router.push("/business/prompt-results");
    } catch (e) {
      console.error(e);
      alert("Kunde inte genomföra analysen. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 pt-20 sm:pt-24">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold">AI för företag</h1>
          <p className="text-gray-400">Ange webbplats och avdelning – få 3 skräddarsydda AI‑prompts</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Webbplats</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://dittforetag.se"
              className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Avdelning</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDepartment(d.value)}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    department === d.value ? 'border-white bg-zinc-900' : 'border-zinc-800 bg-black hover:bg-zinc-900'
                  }`}
                >
                  <div className="font-medium">{d.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{d.value}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startAnalysis}
            disabled={!url || !department || loading}
            className={`w-full py-4 rounded-xl font-semibold transition-all ${
              !url || !department || loading ? 'bg-zinc-900 text-gray-500' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {loading ? `Analyserar... ${progress}%` : 'Generera 3 AI‑prompts'}
          </button>
        </div>
      </div>
    </main>
  );
}