"use client";

import { useEffect, useState } from "react";

export default function InboxPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("");
  const load = async () => {
    const qs = filter ? `?type=${encodeURIComponent(filter)}` : '';
    const r = await fetch(`/api/inbox/list${qs}`);
    const j = await r.json();
    setItems(j.items || []);
  };
  useEffect(() => { load(); }, [filter]);
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto p-6 pt-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Inbox</h1>
          <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="">Alla</option>
            <option value="lead">Lead</option>
            <option value="support">Support</option>
          </select>
        </div>
        <div className="grid gap-4">
          {items.map(it => (
            <div key={it.id} className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <div className="text-sm text-gray-600 mb-2">{it.type} • {new Date(it.createdAt).toLocaleString()} • status: {it.status}</div>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{JSON.stringify(it.payload, null, 2)}</pre>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-gray-600">Inga händelser.</div>}
        </div>
      </div>
    </div>
  );
}


