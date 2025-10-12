"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [data, setData] = useState<{ bots: number; messages: number; actions: number; approvalsPending?: number } | null>(null);
  useEffect(() => { (async () => { const r = await fetch('/api/metrics'); setData(await r.json()); })(); }, []);
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto p-6 pt-20">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
            <div className="text-sm text-gray-600">Aktiva botar</div>
            <div className="text-3xl font-bold">{data?.bots ?? '—'}</div>
          </div>
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
            <div className="text-sm text-gray-600">Meddelanden</div>
            <div className="text-3xl font-bold">{data?.messages ?? '—'}</div>
          </div>
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
            <div className="text-sm text-gray-600">Åtgärder</div>
            <div className="text-3xl font-bold">{data?.actions ?? '—'}</div>
          </div>
        </div>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
            <div className="text-sm text-gray-600">Väntande godkännanden</div>
            <div className="text-3xl font-bold">{data?.approvalsPending ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


