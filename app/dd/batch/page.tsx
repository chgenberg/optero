"use client";

import { useState } from "react";

export default function DDBatch() {
  const [list, setList] = useState("https://exempel1.se\nhttps://exempel2.se");
  const [ranked, setRanked] = useState<any[]|null>(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    setRanked(null);
    try {
      const urls = list.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      const r = await fetch('/api/dd/batch', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ urls }) });
      const d = await r.json();
      setRanked(d.ranked || []);
    } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto p-6 pt-20">
        <h1 className="text-3xl font-bold mb-6">DD Batch‑analys</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-2">Lista av URL:er</h2>
            <textarea value={list} onChange={(e)=>setList(e.target.value)} rows={10} className="w-full border rounded-xl px-3 py-2" />
            <div className="mt-3">
              <button onClick={run} disabled={loading} className="px-6 py-3 bg-gray-900 text-white rounded-xl">{loading? 'Analyserar...' : 'Kör batch'}</button>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-2">Ranking</h2>
            {ranked ? (
              <div className="grid gap-2">
                {ranked.map((r,i)=> (
                  <div key={r.url} className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2">
                    <div>
                      <div className="font-semibold">{i+1}. {r.url}</div>
                      <div className="text-sm text-gray-600">Score: {r.score}</div>
                    </div>
                    <a className="px-3 py-2 bg-white border-2 border-gray-900 rounded-xl" href={`/dd?url=${encodeURIComponent(r.url)}`} target="_blank" rel="noreferrer">Öppna DD</a>
                  </div>
                ))}
              </div>
            ) : (<div className="text-sm text-gray-600">Kör batch för att se ranking.</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}


