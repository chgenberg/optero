"use client";

import { useState } from "react";

export default function DemoPage() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [contact, setContact] = useState({ name: '', email: '', company: '', message: '' });

  const seed = async () => {
    setSeeding(true);
    setResult(null);
    try {
      const r = await fetch('/api/demo/seed', { method: 'POST' });
      const data = await r.json();
      setResult(data);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto p-6 pt-20">
        <h1 className="text-3xl font-bold mb-6">Demo</h1>
        <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
          <p className="mb-4">Skapa ett demo-bolag med tre botar, analys och dashboards.</p>
          <button onClick={seed} disabled={seeding} className="px-6 py-3 bg-gray-900 text-white rounded-xl">{seeding ? 'Skapar...' : 'Skapa demo'}</button>
        </div>

        {result && (
          <div className="mt-8 grid gap-3">
            <a className="underline" href={`/dd?url=${encodeURIComponent(result.url)}`}>Öppna DD</a>
            <a className="underline" href={`/analytics`}>Öppna Analytics</a>
            <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">Botar</h2>
              <ul className="list-disc list-inside text-sm">
                {(result.bots || []).map((b: any) => (
                  <li key={b.id}><span className="font-semibold">{b.name}</span> – <a className="underline" href={`/bots/${b.id}`} target="_blank" rel="noreferrer">öppna chat</a></li>
                ))}
              </ul>
            </div>
            <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">Kontakt</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <input placeholder="Namn" value={contact.name} onChange={(e)=>setContact({ ...contact, name: e.target.value })} className="border rounded px-3 py-2" />
                <input placeholder="Email" value={contact.email} onChange={(e)=>setContact({ ...contact, email: e.target.value })} className="border rounded px-3 py-2" />
                <input placeholder="Företag" value={contact.company} onChange={(e)=>setContact({ ...contact, company: e.target.value })} className="border rounded px-3 py-2 md:col-span-2" />
                <textarea placeholder="Meddelande" value={contact.message} onChange={(e)=>setContact({ ...contact, message: e.target.value })} rows={4} className="border rounded px-3 py-2 md:col-span-2" />
              </div>
              <div className="mt-3">
                <button onClick={async()=>{ await fetch('/api/contact',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...contact, context: result })}); alert('Tack! Vi hör av oss.'); }} className="px-5 py-3 bg-gray-900 text-white rounded-xl">Skicka</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


