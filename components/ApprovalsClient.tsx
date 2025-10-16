"use client";

import React, { useEffect, useState } from "react";

export default function ApprovalsClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('pending');

  async function load() {
    setLoading(true);
    try {
      const q = status === 'all' ? '' : status;
      const res = await fetch(`/api/approvals/list?status=${q}`);
      const data = await res.json();
      setItems(Array.isArray(data?.approvals) ? data.approvals : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status]);

  async function act(id: string, action: string) {
    const res = await fetch('/api/approvals/act', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    if (res.ok) load();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Approvals</h1>
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="minimal-input">
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
  );
}


