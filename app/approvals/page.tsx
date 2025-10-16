import ApprovalsClient from "@/components/ApprovalsClient";

export default function ApprovalsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-24 pb-24">
      <ApprovalsClient />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function ApprovalsPage() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => { const r = await fetch('/api/approvals/list'); const j = await r.json(); setItems(j.items || []); };
  useEffect(() => { load(); }, []);
  const act = async (id: string, approve: boolean) => { await fetch('/api/approvals/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approve }) }); await load(); };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto p-6 pt-20">
        <h1 className="text-3xl font-bold mb-6">Godkännanden</h1>
        <div className="grid gap-4">
          {items.map((it) => (
            <div key={it.id} className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <div className="text-sm text-gray-600 mb-2">{it.type} • {new Date(it.createdAt).toLocaleString()}</div>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{JSON.stringify(it.payload, null, 2)}</pre>
              <div className="mt-4 flex gap-2">
                <button onClick={() => act(it.id, true)} className="px-4 py-2 bg-gray-900 text-white rounded-xl">Godkänn</button>
                <button onClick={() => act(it.id, false)} className="px-4 py-2 bg-white border-2 border-gray-900 rounded-xl">Avslå</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-gray-600">Inga väntande godkännanden.</div>}
        </div>
      </div>
    </div>
  );
}


