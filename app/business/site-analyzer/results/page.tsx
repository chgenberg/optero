"use client";

import { useEffect, useState } from "react";
import LoadingAnalysis from "@/components/LoadingAnalysis";

export default function BusinessResults() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("companyAnalysis");
    if (!saved) return;
    setData(JSON.parse(saved));
    setLoading(false);
  }, []);

  const generate = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/business/generate-company-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url, department: data.dept, content: data.content })
      });
      const res = await resp.json();
      setData({ ...data, solutions: res.solutions || [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generate(); }, [data?.url]);

  if (loading) return <LoadingAnalysis />;

  return (
    <div className="min-h-screen pt-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI‑förslag för {data?.url}</h1>
      <p className="text-gray-600 mb-6">Avdelning: {data?.dept}</p>
      <div className="space-y-6">
        {(data?.solutions || []).map((s: any, i: number) => (
          <div key={i} className="bg-white rounded-xl p-5 border shadow">
            <h3 className="font-semibold mb-2">{s.task}</h3>
            <p className="text-sm text-gray-700 mb-3">{s.solution}</p>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">{s.prompt}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}


