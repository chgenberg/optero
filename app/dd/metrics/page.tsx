"use client";

import { useState } from "react";

type Row = { category: string; key: string; period: string; value: string; source: string };

export default function DD_Metrics() {
  const [url, setUrl] = useState("");
  const [rows, setRows] = useState<Row[]>([{ category: "financials", key: "ARR", period: "2025", value: "0", source: "customer" }]);
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const out: Row[] = [];
    for (const line of lines) {
      const [category, key, period, value, source] = line.split(",").map(s => s.trim());
      if (category && key && period && value) out.push({ category, key, period, value, source: source || 'file' });
    }
    setRows(out.length ? out : rows);
  };
  const importData = async () => {
    const items = rows.map(r => ({ ...r, value: parseFloat(r.value) }));
    const res = await fetch('/api/dd/metrics/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, items }) });
    const data = await res.json();
    alert(`Importerade: ${data.imported || 0}`);
  };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto p-6 pt-20 pb-20">
        <h1 className="text-3xl font-bold mb-6">DD Metrics</h1>
        <div className="bg-white border-2 border-gray-900 rounded-2xl p-6 mb-6">
          <label className="block text-sm font-semibold mb-2">Företagets URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://exempel.se" className="w-full border border-gray-200 rounded-xl px-4 py-3" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">Manuell inmatning</h2>
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-5 gap-2">
                  <input value={r.category} onChange={(e) => { const a=[...rows]; a[i].category=e.target.value; setRows(a); }} className="border rounded px-2 py-1" />
                  <input value={r.key} onChange={(e) => { const a=[...rows]; a[i].key=e.target.value; setRows(a); }} className="border rounded px-2 py-1" />
                  <input value={r.period} onChange={(e) => { const a=[...rows]; a[i].period=e.target.value; setRows(a); }} className="border rounded px-2 py-1" />
                  <input value={r.value} onChange={(e) => { const a=[...rows]; a[i].value=e.target.value; setRows(a); }} className="border rounded px-2 py-1" />
                  <input value={r.source} onChange={(e) => { const a=[...rows]; a[i].source=e.target.value; setRows(a); }} className="border rounded px-2 py-1" />
                </div>
              ))}
              <button onClick={() => setRows([...rows, { category: "", key: "", period: "", value: "", source: "customer" }])} className="px-3 py-2 bg-white border-2 border-gray-900 rounded-xl">Lägg rad</button>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">CSV‑import</h2>
            <p className="text-sm text-gray-600 mb-2">Format: category,key,period,value,source</p>
            <textarea onChange={(e) => parseCSV(e.target.value)} rows={10} className="w-full border rounded-xl px-3 py-2" placeholder={`financials,ARR,2025,1200000,customer`}></textarea>
          </div>
        </div>
        <div className="mt-6">
          <button onClick={importData} className="px-6 py-3 bg-gray-900 text-white rounded-xl">Importera</button>
        </div>
      </div>
    </div>
  );
}


