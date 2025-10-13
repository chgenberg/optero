"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function BuildExecutiveConsultant() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [bots, setBots] = useState<any>(null);
  const [docsText, setDocsText] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scoring, setScoring] = useState<any>(null);
  const [quickKpi, setQuickKpi] = useState({ mql: '', tickets: '', aht: '', conversion: '' });
  const [problem, setProblem] = useState<string>("");
  const [snippets, setSnippets] = useState<Record<string, string>>({});
  const [updatingBot, setUpdatingBot] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState({ webhookUrl: '', slackWebhook: '', hubspotEnabled: false });
  const [blueprint, setBlueprint] = useState<'conservative'|'standard'|'aggressive'>('standard');
  const [errors, setErrors] = useState<{ webhookUrl?: string; slackWebhook?: string }>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(['knowledge.faq','lead.standard','support.standard']);
  const [smokes, setSmokes] = useState<Record<string, { loading: boolean; pass: boolean | null; reply?: string }>>({});

  // Persist selections
  useEffect(()=>{
    try {
      const raw = localStorage.getItem('exec_build_wizard');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.url) setUrl(s.url);
        if (s.quickKpi) setQuickKpi(s.quickKpi);
        if (s.integrations) setIntegrations(s.integrations);
        if (s.blueprint) setBlueprint(s.blueprint);
        if (s.problem) setProblem(s.problem);
        if (Array.isArray(s.selectedTemplates)) setSelectedTemplates(s.selectedTemplates);
      }
    } catch {}
  }, []);
  useEffect(()=>{
    try {
      localStorage.setItem('exec_build_wizard', JSON.stringify({ url, quickKpi, integrations, blueprint, problem, selectedTemplates }));
    } catch {}
  }, [url, quickKpi, integrations, blueprint, problem, selectedTemplates]);

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

  const saveQuickKpis = async () => {
    const items: any[] = [];
    if (quickKpi.mql) items.push({ category:'sales', key:'MQL', period:'latest', value: parseFloat(quickKpi.mql), source:'customer' });
    if (quickKpi.tickets) items.push({ category:'support', key:'tickets', period:'latest', value: parseFloat(quickKpi.tickets), source:'customer' });
    if (quickKpi.aht) items.push({ category:'support', key:'AHT', period:'latest', value: parseFloat(quickKpi.aht), source:'customer' });
    if (quickKpi.conversion) items.push({ category:'web', key:'conversion', period:'latest', value: parseFloat(quickKpi.conversion), source:'customer' });
    if (!items.length) return;
    await fetch('/api/dd/metrics/import',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ url, items }) });
  };

  const validate = () => {
    const e: { webhookUrl?: string; slackWebhook?: string } = {};
    const urlRe = /^https?:\/\//i;
    if (integrations.webhookUrl && !urlRe.test(integrations.webhookUrl)) e.webhookUrl = 'Måste börja med http(s)://';
    if (integrations.slackWebhook && !urlRe.test(integrations.slackWebhook)) e.slackWebhook = 'Måste börja med http(s)://';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildBots = async () => {
    if (!result) return;
    if (!validate()) return;
    await saveQuickKpis();
    fetch('/api/dd/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
      .then(r=>r.json()).then(d=>setScoring(d)).catch(()=>{});
    const res = await fetch('/api/dd/playbooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, analysis: result, problem, userKpis: quickKpi, integrations, blueprint, selectedTemplates }) });
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

  useEffect(() => {
    const loadSnippets = async () => {
      if (!bots?.created) return;
      const map: Record<string, string> = {};
      await Promise.all(
        bots.created.map(async (b: any) => {
          try {
            const s = await fetch(`/api/bots/snippet?botId=${encodeURIComponent(b.id)}`);
            const dj = await s.json();
            if (dj?.snippet) map[b.id] = dj.snippet;
          } catch {}
        })
      );
      setSnippets(map);
    };
    loadSnippets();
  }, [bots]);

  // Smoke tests after creation
  useEffect(() => {
    const run = async () => {
      if (!bots?.created) return;
      for (const b of bots.created as any[]) {
        setSmokes(prev => ({ ...prev, [b.id]: { loading: true, pass: null } }));
        try {
          const subtype = (b.spec?.subtype || '') as string;
          let name = 'Smoke';
          let input = '';
          let expected = '';
          if (b.type === 'knowledge') {
            name = 'Knowledge smoke';
            input = 'Vad erbjuder ni?';
            expected = '(tjänst|produkt|vi|vår|om\soss)';
          } else if (b.type === 'lead') {
            name = 'Lead smoke';
            input = 'Vi vill öka MQL nästa kvartal. Vad behöver ni av mig?';
            expected = '(mål|kpi|budget|tidsram|nästa steg)';
            if (subtype === 'guided_selling') expected = '(paket|rekommenderar|mål|budget)';
          } else if (b.type === 'support') {
            name = 'Support smoke';
            input = 'Min order fungerar inte, vad gör jag?';
            expected = '(lösning|steg|föreslår|sammanfattning)';
            if (subtype === 'it_helpdesk') expected = '(nätverk|omstart|felsök|steg)';
          }
          const add = await fetch('/api/bots/eval/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId: b.id, name, input, expectedMatch: expected }) });
          const addJ = await add.json();
          const evalId = addJ?.eval?.id;
          if (!evalId) throw new Error('add eval failed');
          const runRes = await fetch('/api/bots/eval/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evalId }) });
          const runJ = await runRes.json();
          const pass = Boolean(runJ?.result?.lastPass);
          const reply = runJ?.result?.lastReply || '';
          setSmokes(prev => ({ ...prev, [b.id]: { loading: false, pass, reply } }));
        } catch {
          setSmokes(prev => ({ ...prev, [b.id]: { loading: false, pass: false } }));
        }
      }
    };
    run();
  }, [bots]);

  // Auto blueprint + HubSpot detection when analysis available
  useEffect(() => {
    try {
      const risk: number | undefined = result?.scoring?.riskScore;
      if (typeof risk === 'number') {
        const nextBp = risk > 60 ? 'conservative' : risk > 30 ? 'standard' : 'aggressive';
        setBlueprint(nextBp as any);
      }
      const scrapeContent: string = (result?.scrape?.content || '').toLowerCase();
      const hubspotHit = /hubspot|hs-analytics|hs-script|js\.hs|hsforms/i.test(scrapeContent);
      if (hubspotHit && !integrations.hubspotEnabled) {
        setIntegrations(prev => ({ ...prev, hubspotEnabled: true }));
      }
    } catch {}
  }, [result]);

  const stepLabel = useMemo(() => {
    if (currentStep === 1) return 'URL';
    if (currentStep === 2) return 'Dokument';
    return 'Problem + KPI';
  }, [currentStep]);

  const canProceedStep1 = Boolean(url.trim());
  const onNextFromStep1 = async () => {
    if (!canProceedStep1) return;
    await analyze();
    setCurrentStep(2);
  };

  const onNextFromStep2 = async () => {
    await analyze();
    setCurrentStep(3);
  };

  const updateRequireApproval = async (botId: string, nextVal: boolean) => {
    setUpdatingBot(botId);
    try {
      await fetch('/api/bots/update', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ botId, specPatch: { requireApproval: nextVal } }) });
      setBots((prev: any) => {
        if (!prev?.created) return prev;
        const created = prev.created.map((b: any) => b.id === botId ? { ...b, spec: { ...(b.spec||{}), requireApproval: nextVal } } : b);
        return { ...prev, created };
      });
    } finally {
      setUpdatingBot(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto p-6 pt-20 pb-20">
        <h1 className="text-3xl font-bold mb-6">Bygg Executive‑konsultbot</h1>

        <div className="flex items-center gap-2 text-sm mb-4">
          {[1,2,3].map((i)=> (
            <div key={i} className={`flex-1 h-2 rounded-full ${currentStep>=i? 'bg-gray-900' : 'bg-gray-200'}`}></div>
          ))}
          <div className="ml-2 text-gray-600">{stepLabel}</div>
        </div>

        <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: '0 0 0 0 rgba(0,0,0,0.06)' }}></div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold">Företagets URL</label>
              <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://exempel.se" className="w-full border border-gray-200 rounded-xl px-4 py-3" />
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-gray-600">Vi använder endast publikt innehåll.</div>
                <button onClick={onNextFromStep1} disabled={!canProceedStep1 || loading} className="px-5 py-3 bg-gray-900 text-white rounded-xl">{loading? 'Analyserar…' : 'Nästa'}</button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold mb-2">Dokument (PDF/DOCX/XLSX)</div>
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

              <div className="flex items-center justify-between pt-2">
                <button onClick={()=>setCurrentStep(1)} className="px-4 py-2 border border-gray-300 rounded-xl">Tillbaka</button>
                <div className="flex gap-2">
                  <button onClick={()=>setCurrentStep(3)} className="px-4 py-2 border border-gray-300 rounded-xl">Hoppa över</button>
                  <button onClick={onNextFromStep2} disabled={loading || !url.trim()} className="px-5 py-3 bg-gray-900 text-white rounded-xl">{loading? 'Analyserar…' : 'Fortsätt'}</button>
                </div>
              </div>

              {result && (
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <h2 className="text-lg font-bold mb-2">Profil</h2>
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
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <h2 className="text-lg font-bold mb-2">Scoring</h2>
                    <div className="text-sm text-gray-700">
                      <div><span className="font-semibold">Opportunity:</span> {result.scoring?.opportunityScore ?? '—'}/100</div>
                      <div><span className="font-semibold">Risk:</span> {result.scoring?.riskScore ?? '—'}/100</div>
                      <div className="mt-2 whitespace-pre-wrap">{result.scoring?.rationale || ''}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Problem</label>
                <textarea value={problem} onChange={(e)=>setProblem(e.target.value)} placeholder="Beskriv kort det största problemet" rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3" />
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">Snabb KPI</div>
                <div className="grid md:grid-cols-4 gap-3 text-sm">
                  {[{key:'mql',tip:'Leads/månad'}, {key:'tickets',tip:'Ärenden/månad'}, {key:'aht',tip:'Genomsnittlig hanteringstid (min)'}, {key:'conversion',tip:'Konvertering %'}].map(({key,tip})=> (
                    <label key={key} className="text-sm">
                      <span className="block mb-1 font-semibold flex items-center gap-1">{key.toUpperCase()} <span className="text-gray-500" title={tip}>?</span></span>
                      <input value={(quickKpi as any)[key]} onChange={(e)=>setQuickKpi({ ...quickKpi, [key]: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="text-sm font-semibold">Integrationer</div>
                  <label className="block text-sm">
                    <span className="block mb-1 font-semibold">Webhook URL</span>
                    <input value={integrations.webhookUrl} onChange={(e)=>setIntegrations({ ...integrations, webhookUrl: e.target.value })} className={`w-full border rounded px-3 py-2 ${errors.webhookUrl ? 'border-red-500' : ''}`} placeholder="https://example.com/webhook" />
                    {errors.webhookUrl && <div className="text-xs text-red-600 mt-1">{errors.webhookUrl}</div>}
                  </label>
                  <label className="block text-sm">
                    <span className="block mb-1 font-semibold">Slack webhook</span>
                    <input value={integrations.slackWebhook} onChange={(e)=>setIntegrations({ ...integrations, slackWebhook: e.target.value })} className={`w-full border rounded px-3 py-2 ${errors.slackWebhook ? 'border-red-500' : ''}`} placeholder="https://hooks.slack.com/services/..." />
                    {errors.slackWebhook && <div className="text-xs text-red-600 mt-1">{errors.slackWebhook}</div>}
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={integrations.hubspotEnabled} onChange={(e)=>setIntegrations({ ...integrations, hubspotEnabled: e.target.checked })} />
                    HubSpot aktiverad
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold">Blueprint</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {([
                      { key:'conservative', title:'Conservative', hint:'Alltid approval, lägre aktivitetsnivå' },
                      { key:'standard', title:'Standard', hint:'Approval på, balanserad aktivitetsnivå' },
                      { key:'aggressive', title:'Aggressive', hint:'Mindre friktion, fler automatiska steg' }
                    ] as any[]).map(opt => (
                      <button key={opt.key} onClick={()=>setBlueprint(opt.key)} className={`border rounded-xl px-3 py-2 text-left ${blueprint===opt.key? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                        <div className="font-semibold">{opt.title}</div>
                        <div className="text-xs text-gray-600">{opt.hint}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">Välj bot‑mallar</div>
                <div className="grid md:grid-cols-3 gap-2 text-sm">
                  {[
                    { key:'knowledge.faq', title:'Knowledge – FAQ/Policy' },
                    { key:'knowledge.onboarding', title:'Knowledge – Onboarding' },
                    { key:'lead.standard', title:'Lead – Qualification' },
                    { key:'lead.guided_selling', title:'Lead – Guided selling' },
                    { key:'support.standard', title:'Support – Triage' },
                    { key:'support.it_helpdesk', title:'Support – IT Helpdesk' }
                  ].map(opt => (
                    <label key={opt.key} className={`border rounded-xl px-3 py-2 flex items-center gap-2 ${selectedTemplates.includes(opt.key)? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(opt.key)}
                        onChange={(e)=>{
                          setSelectedTemplates(prev => e.target.checked ? Array.from(new Set([...prev, opt.key])) : prev.filter(k=>k!==opt.key));
                        }}
                      />
                      <span>{opt.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={()=>setCurrentStep(2)} className="px-4 py-2 border border-gray-300 rounded-xl">Tillbaka</button>
                <button onClick={()=>{ if (validate()) setConfirmOpen(true); }} disabled={!url.trim() || !result || !problem.trim()} className="px-5 py-3 bg-gray-900 text-white rounded-xl">Bygg min bot</button>
              </div>

              {scoring && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <div className="text-sm font-semibold mb-1">Uppdaterad scoring</div>
                  <pre className="bg-white border border-gray-100 p-3 rounded text-xs overflow-auto">{JSON.stringify(scoring, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {bots && (
          <div className="mt-8 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">Bot klar</h2>
              <ul className="space-y-2 text-sm">
                {(bots.created || []).map((b: any) => (
                  <li key={b.id} className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold capitalize">{b.type}</div>
                      <a className="underline" href={`/bots/${b.id}`} target="_blank" rel="noreferrer">öppna chat</a>
                      <div className="mt-1 text-xs">
                        {smokes[b.id]?.loading && <span className="text-gray-500">Testar…</span>}
                        {smokes[b.id] && smokes[b.id].pass === true && <span className="text-green-600">PASS</span>}
                        {smokes[b.id] && smokes[b.id].pass === false && <span className="text-red-600">FAIL</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-700">requireApproval</label>
                      <input type="checkbox" checked={Boolean(b.spec?.requireApproval)} onChange={(e)=>updateRequireApproval(b.id, e.target.checked)} disabled={updatingBot===b.id} />
                      <button
                        onClick={async()=>{
                          setSmokes(prev => ({ ...prev, [b.id]: { ...(prev[b.id]||{pass:null}), loading: true } }));
                          try {
                            const list = await fetch(`/api/bots/eval/list?botId=${encodeURIComponent(b.id)}`);
                            const lj = await list.json();
                            const existing = (lj?.evals || []).find((e:any)=>/smoke/i.test(e.name));
                            let evalId = existing?.id;
                            if (!evalId) {
                              const add = await fetch('/api/bots/eval/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId: b.id, name: 'Smoke', input: 'Snabb kontroll', expectedMatch: '.' }) });
                              const addJ = await add.json(); evalId = addJ?.eval?.id;
                            }
                            if (evalId) {
                              const runRes = await fetch('/api/bots/eval/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evalId }) });
                              const runJ = await runRes.json();
                              setSmokes(prev => ({ ...prev, [b.id]: { loading: false, pass: Boolean(runJ?.result?.lastPass), reply: runJ?.result?.lastReply || '' } }));
                            } else {
                              setSmokes(prev => ({ ...prev, [b.id]: { loading: false, pass: false } }));
                            }
                          } catch { setSmokes(prev => ({ ...prev, [b.id]: { loading: false, pass: false } })); }
                        }}
                        className="text-xs px-2 py-1 border border-gray-300 rounded"
                      >Kör test igen</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">Installations‑snippet</h3>
              <div className="space-y-4">
                {(bots.created || []).map((b: any) => (
                  <div key={b.id} className="text-xs">
                    <div className="font-semibold mb-1">{b.type}</div>
                    <pre className="bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">{snippets[b.id] || 'Laddar snippet…'}</pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right">
              <a className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-xl mr-3" href={`/api/dd/export/markdown?url=${encodeURIComponent(url)}`}>Ladda ner rapport (MD)</a>
              <button onClick={refreshScoring} className="px-5 py-2 bg-gray-900 text-white rounded-xl">Uppdatera scoring</button>
            </div>
          </div>
        )}

        {/* Confirm modal */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={()=>setConfirmOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold mb-3">Bekräfta innan bygg</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold">Problem</div>
                  <div className="text-gray-700 whitespace-pre-wrap">{problem || '—'}</div>
                </div>
                <div>
                  <div className="font-semibold">KPI</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(quickKpi).map(([k,v])=> (
                      <div key={k} className="flex justify-between"><span className="uppercase text-gray-600">{k}</span><span>{v || '—'}</span></div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Integrationer</div>
                  <div className="text-gray-700">
                    <div>Webhook: {integrations.webhookUrl || '—'}</div>
                    <div>Slack: {integrations.slackWebhook || '—'}</div>
                    <div>HubSpot: {integrations.hubspotEnabled ? 'På' : 'Av'}</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Blueprint</div>
                  <div className="text-gray-700 capitalize">{blueprint}</div>
                </div>
                <div>
                  <div className="font-semibold">Mallar</div>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedTemplates.map(k => (<li key={k}>{k}</li>))}
                  </ul>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={()=>setConfirmOpen(false)} className="px-4 py-2 border border-gray-300 rounded-xl">Avbryt</button>
                <button onClick={()=>{ setConfirmOpen(false); buildBots(); }} className="px-5 py-2 bg-gray-900 text-white rounded-xl">Bekräfta & bygg</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


