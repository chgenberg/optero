"use client";

import { useState, useRef } from "react";

export default function DueDiligence() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [bots, setBots] = useState<any>(null);
  const [docsText, setDocsText] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scoring, setScoring] = useState<any>(null);
  const [quickKpi, setQuickKpi] = useState({ mql: '', tickets: '', aht: '', conversion: '' });

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setBots(null);
    try {
      const res = await fetch('/api/dd/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, documents: docsText }) });
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

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const form = new FormData();
    Array.from(files).forEach(f => form.append('files', f));
    setUploading(true);
    try {
      const r = await fetch('/api/business/upload-documents', { method: 'POST', body: form });
      const d = await r.json();
      if (d?.content) setDocsText(prev => (prev ? prev + "\n\n" : "") + d.content);
    } finally { setUploading(false); }
  };

  const refreshScoring = async () => {
    const r = await fetch('/api/dd/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
    const d = await r.json();
    setScoring(d);
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

        {/* Material/KPI‑underlag */}
        <div className="bg-white border-2 border-gray-900 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-3">Lägg till material (PDF/Word/Excel/Keynote→PDF)</h2>
          <div
            onDragOver={(e)=>e.preventDefault()}
            onDrop={(e)=>{ e.preventDefault(); onFilesSelected(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-xl p-6 text-center ${uploading? 'opacity-60' : ''}`}
          >
            Släpp filer här eller
            <button onClick={()=>fileInputRef.current?.click()} className="ml-2 underline">välj filer</button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e)=>onFilesSelected(e.target.files)} />
          </div>
          {docsText && (
            <div className="mt-3 text-sm text-gray-600">Material tillagt ({docsText.length} tecken). Detta inkluderas i analysen.</div>
          )}
        </div>

        {result && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">Profil</h2>
              <div className="text-sm text-gray-700">
                <div><span className="font-semibold">Företag:</span> {result.profile?.companyName || '—'}{typeof result.confidence?.companyName==='number' ? ` (conf ${Math.round(result.confidence.companyName*100)}%)` : ''}</div>
                <div><span className="font-semibold">Sektor:</span> {result.profile?.sector || '—'}{typeof result.confidence?.sector==='number' ? ` (conf ${Math.round(result.confidence.sector*100)}%)` : ''}</div>
                <div><span className="font-semibold">USPs:</span> {(result.profile?.USPs || []).join(', ') || '—'}</div>
                <div className="mt-3">
                  <div className="font-semibold">Citations</div>
                  <ul className="list-disc list-inside text-xs text-gray-600">
                    {Object.keys(result.citations || {}).slice(0,4).map((k)=>{
                      const arr = (result.citations?.[k]||[]).slice(0,2);
                      if (!arr.length) return null;
                      return (
                        <li key={k}><span className="font-semibold">{k}:</span> {arr.map((c:any)=>`“${(c.snippet||'').replace(/\n/g,' ').slice(0,140)}”`).join(' • ')}</li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">Scoring</h2>
              <div className="text-sm text-gray-700">
                <div><span className="font-semibold">Opportunity:</span> {result.scoring?.opportunityScore ?? '—'}/100</div>
                <div><span className="font-semibold">Risk:</span> {result.scoring?.riskScore ?? '—'}/100</div>
                <div className="mt-2 whitespace-pre-wrap">{result.scoring?.rationale || ''}</div>
                <div className="mt-4">
                  <div className="font-semibold">Gap‑analys (± toleranser)</div>
                  {(()=>{
                    const bm:any = { conversion:{target:3.5,tol:0.5}, AHT:{target:15,tol:2}, MQL:{target:500,tol:50}, tickets:{target:400,tol:50} };
                    const keys = Object.keys(bm);
                    const findVal = (k:string)=>{
                      // no metrics in result payload; hint text only
                      return undefined;
                    };
                    return (
                      <ul className="list-disc list-inside text-xs">
                        {keys.map(k=>{
                          const target=bm[k].target, tol=bm[k].tol;
                          return (
                            <li key={k}>
                              {k}: mål={target} ±{tol}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {result && !bots && (
          <div className="mt-8">
            <div className="flex gap-3">
              <button onClick={createPlaybooks} className="px-6 py-3 bg-gray-900 text-white rounded-xl">Skapa bot‑playbooks</button>
              <a className="px-6 py-3 bg-white border-2 border-gray-900 rounded-xl" href={`/api/dd/export/markdown?url=${encodeURIComponent(url)}`}>Ladda ner rapport (MD)</a>
              <button onClick={refreshScoring} className="px-6 py-3 bg-white border-2 border-gray-900 rounded-xl">Uppdatera scoring</button>
            </div>
          </div>
        )}

        {scoring && (
          <div className="mt-8 bg-white border-2 border-gray-900 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">Uppdaterad scoring</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{JSON.stringify(scoring, null, 2)}</pre>
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

        {/* Snabb KPI‑panel */}
        <div className="mt-8 bg-white border-2 border-gray-900 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-3">Snabb KPI‑inmatning</h2>
          <div className="grid md:grid-cols-4 gap-3 text-sm">
            {['mql','tickets','aht','conversion'].map((k)=> (
              <label key={k} className="text-sm">
                <span className="block mb-1 font-semibold">{k.toUpperCase()}</span>
                <input value={(quickKpi as any)[k]} onChange={(e)=>setQuickKpi({ ...quickKpi, [k]: e.target.value })} className="w-full border rounded px-3 py-2" />
              </label>
            ))}
          </div>
          <div className="mt-3">
            <button
              onClick={async()=>{
                const items:any[]=[];
                if (quickKpi.mql) items.push({ category:'sales', key:'MQL', period:'latest', value: parseFloat(quickKpi.mql), source:'customer' });
                if (quickKpi.tickets) items.push({ category:'support', key:'tickets', period:'latest', value: parseFloat(quickKpi.tickets), source:'customer' });
                if (quickKpi.aht) items.push({ category:'support', key:'AHT', period:'latest', value: parseFloat(quickKpi.aht), source:'customer' });
                if (quickKpi.conversion) items.push({ category:'web', key:'conversion', period:'latest', value: parseFloat(quickKpi.conversion), source:'customer' });
                if (!items.length) return;
                await fetch('/api/dd/metrics/import',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ url, items }) });
                alert('KPI sparade. Klicka Uppdatera scoring.');
              }}
              className="px-5 py-3 bg-gray-900 text-white rounded-xl"
            >Spara KPI</button>
          </div>
        </div>
      </div>
    </div>
  );
}


