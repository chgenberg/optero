"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessSiteAnalyzer() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [dept, setDept] = useState("");
  const [loading, setLoading] = useState(false);
  const departments = [
    "Försäljning","Marknad","HR","Ekonomi","Kundtjänst","Drift","IT","Inköp","Legal","Ledningsgrupp","Produkt","Support","Reception","Kommunikation","Logistik","Kvalitet","Data & Analytics","UX/UI","Engineering","Compliance"
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
      sessionStorage.setItem("companyAnalysis", JSON.stringify({ url, dept, content: data.content || "" }));
      router.push("/business/site-analyzer/results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI för företag</h1>
      <div className="space-y-6 bg-white rounded-2xl p-6 shadow border">
        <div>
          <label className="block text-sm font-medium mb-2">Företagets URL</label>
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://dittforetag.se" className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Avdelning</label>
          <select value={dept} onChange={e=>setDept(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-white">
            <option value="">Välj avdelning…</option>
            {departments.map(d=> <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button disabled={!url || !dept || loading} onClick={startAnalysis} className="w-full bg-gray-900 text-white rounded-lg py-3 disabled:opacity-50">
          {loading ? "Analyserar webbplats…" : "Starta analys"}
        </button>
      </div>
    </div>
  );
}


