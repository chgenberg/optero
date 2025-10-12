"use client";

import { useState } from "react";

export default function DueDiligence() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [bots, setBots] = useState<any>(null);

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setBots(null);
    try {
      const res = await fetch('/api/dd/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const createPlaybooks = async () => {
    if (!result) return;
    const res = await fetch('/api/dd/playbooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, analysis: result }) });
    const data = await res.json();
    setBots(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto p-6 pt-20 pb-20">
        <h1 className="text-3xl font-bold mb-6">Due Diligence</h1>
        <div className="bg-white border-2 border-gray-900 rounded-2xl p-6 mb-8">
          <label className="block text-sm font-semibold mb-2">Företagets URL</label>
          <div className="flex gap-3">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://exempel.se" className="flex-1 border border-gray-200 rounded-xl px-4 py-3" />
            <button onClick={analyze} disabled={loading || !url.trim()} className="px-5 py-3 bg-gray-900 text-white rounded-xl">Analysera</button>
          </div>
          {loading && <div className="mt-3 text-sm text-gray-600">Analyserar...</div>}
        </div>

        {result && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">Profil</h2>
              <div className="text-sm text-gray-700">
                <div><span className="font-semibold">Företag:</span> {result.profile?.companyName || '—'}</div>
                <div><span className="font-semibold">Sektor:</span> {result.profile?.sector || '—'}</div>
                <div><span className="font-semibold">USPs:</span> {(result.profile?.USPs || []).join(', ') || '—'}</div>
              </div>
            </div>
            <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">Scoring</h2>
              <div className="text-sm text-gray-700">
                <div><span className="font-semibold">Opportunity:</span> {result.scoring?.opportunityScore ?? '—'}/100</div>
                <div><span className="font-semibold">Risk:</span> {result.scoring?.riskScore ?? '—'}/100</div>
                <div className="mt-2 whitespace-pre-wrap">{result.scoring?.rationale || ''}</div>
              </div>
            </div>
          </div>
        )}

        {result && !bots && (
          <div className="mt-8">
            <div className="flex gap-3">
              <button onClick={createPlaybooks} className="px-6 py-3 bg-gray-900 text-white rounded-xl">Skapa bot‑playbooks</button>
              <a className="px-6 py-3 bg-white border-2 border-gray-900 rounded-xl" href={`/api/dd/export/markdown?url=${encodeURIComponent(url)}`}>Ladda ner rapport (MD)</a>
            </div>
          </div>
        )}

        {bots && (
          <div className="mt-8 bg-white border-2 border-gray-900 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">Skapade botar</h2>
            <ul className="list-disc list-inside text-sm">
              {(bots.created || []).map((b: any) => (
                <li key={b.id}><span className="font-semibold">{b.type}</span>: <a className="underline" href={`/bots/${b.id}`} target="_blank" rel="noreferrer">öppna chat</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


