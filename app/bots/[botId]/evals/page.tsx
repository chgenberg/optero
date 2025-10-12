"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function BotEvals() {
  const { botId } = useParams() as { botId: string };
  const [evals, setEvals] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', input: '', expectedMatch: '' });
  const load = async() => { const r = await fetch(`/api/bots/eval/list?botId=${botId}`); const j = await r.json(); setEvals(j.evals || []); };
  useEffect(()=>{ load(); }, [botId]);
  const add = async() => { await fetch('/api/bots/eval/add',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ botId, ...form }) }); setForm({ name:'', input:'', expectedMatch:''}); await load(); };
  const run = async(id:string) => { await fetch('/api/bots/eval/run',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ evalId:id }) }); await load(); };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto p-6 pt-20">
        <h1 className="text-3xl font-bold mb-6">Bot‑tester</h1>
        <div className="bg-white border-2 border-gray-900 rounded-2xl p-6 mb-6 grid gap-3">
          <input placeholder="Namn" value={form.name} onChange={(e)=>setForm({ ...form, name:e.target.value })} className="border rounded px-3 py-2" />
          <textarea placeholder="Input" value={form.input} onChange={(e)=>setForm({ ...form, input:e.target.value })} className="border rounded px-3 py-2" rows={4} />
          <input placeholder="Expected match (regex)" value={form.expectedMatch} onChange={(e)=>setForm({ ...form, expectedMatch:e.target.value })} className="border rounded px-3 py-2" />
          <button onClick={add} className="px-5 py-3 bg-gray-900 text-white rounded-xl">Lägg till test</button>
        </div>
        <div className="grid gap-3">
          {evals.map(e => (
            <div key={e.id} className={`bg-white border-2 border-gray-900 rounded-2xl p-6 ${e.lastPass === false ? 'ring-2 ring-red-400' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{e.name}</div>
                  <div className="text-sm text-gray-600">Senast körd: {e.lastRunAt ? new Date(e.lastRunAt).toLocaleString() : 'aldrig'}</div>
                </div>
                <button onClick={()=>run(e.id)} className="px-4 py-2 bg-white border-2 border-gray-900 rounded-xl">Kör</button>
              </div>
              <div className="mt-2 text-sm"><span className="font-semibold">Förväntad:</span> /{e.expectedMatch}/i</div>
              <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">{e.lastReply || ''}</pre>
              {e.lastPass !== null && e.lastPass !== undefined && (
                <div className={`mt-2 text-sm font-semibold ${e.lastPass ? 'text-green-600' : 'text-red-600'}`}>{e.lastPass ? 'PASS' : 'FAIL'}</div>
              )}
            </div>
          ))}
          {evals.length === 0 && <div className="text-sm text-gray-600">Inga testfall ännu.</div>}
        </div>
      </div>
    </div>
  );
}


