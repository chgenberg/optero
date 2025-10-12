"use client";

import { useEffect, useState } from "react";

export default function BotsOverview() {
  const [bots, setBots] = useState<any[]>([]);
  useEffect(() => { (async () => { const r = await fetch('/api/bots/list'); const j = await r.json(); setBots(j.bots || []); })(); }, []);
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto p-6 pt-20">
        <h1 className="text-3xl font-bold mb-6">Mina botar</h1>
        <div className="grid gap-4">
          {bots.map((b) => (
            <div key={b.id} className="bg-white border-2 border-gray-900 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{b.name}</div>
                <div className="text-sm text-gray-600">{b.type} • {b.companyUrl || '—'}</div>
              </div>
              <div className="flex gap-2">
                <a className="px-4 py-2 bg-white border-2 border-gray-900 rounded-xl" href={`/bots/${b.id}`} target="_blank" rel="noreferrer">Öppna chat</a>
                <a className="px-4 py-2 bg-white border-2 border-gray-900 rounded-xl" href={`/bots/${b.id}/versions`}>Versioner</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


