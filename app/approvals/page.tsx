"use client";

import { useEffect, useState } from "react";

export default function ApprovalsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending'|'approved'|'rejected'|'all'>('pending');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/approvals/list?status=${status==='all'?'':status}`);
      const data = await res.json();
      setItems(data.approvals || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const act = async (id: string, action: 'approve'|'reject') => {
    const res = await fetch('/api/approvals/act', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    if (res.ok) load();
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-24 pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Approvals</h1>
          <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="minimal-input">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">No items</div>
        ) : (
          <div className="space-y-4">
            {items.map((it)=> (
              <div key={it.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-2">{new Date(it.createdAt).toLocaleString()}</div>
                <div className="font-mono text-sm break-all mb-3">{JSON.stringify(it.payload)}</div>
                <div className="flex gap-2">
                  <button onClick={()=>act(it.id,'approve')} className="minimal-button">Approve</button>
                  <button onClick={()=>act(it.id,'reject')} className="minimal-button-outline">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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


