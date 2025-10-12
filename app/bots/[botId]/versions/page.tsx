"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function BotVersions() {
  const { botId } = useParams() as { botId: string };
  const [versions, setVersions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const load = async () => { const r = await fetch(`/api/bots/version/list?botId=${botId}`); const j = await r.json(); setVersions(j.versions || []); };
  useEffect(() => { load(); }, [botId]);
  const save = async () => { setSaving(true); await fetch(`/api/bots/version/save?botId=${botId}`, { method: 'POST' }); await load(); setSaving(false); };
  const rollback = async (v: number) => { await fetch(`/api/bots/version/rollback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId, version: v }) }); await load(); };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto p-6 pt-20">
        <h1 className="text-3xl font-bold mb-6">Versioner</h1>
        <div className="mb-4">
          <button onClick={save} disabled={saving} className="px-5 py-3 bg-gray-900 text-white rounded-xl">{saving ? 'Sparar...' : 'Spara ny version'}</button>
        </div>
        <div className="grid gap-3">
          {versions.map(v => (
            <div key={v.version} className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Version {v.version}</div>
                  <div className="text-sm text-gray-600">{new Date(v.createdAt).toLocaleString()}</div>
                </div>
                <button onClick={()=>rollback(v.version)} className="px-4 py-2 bg-white border-2 border-gray-900 rounded-xl">Rollback</button>
              </div>
              <pre className="mt-3 bg-gray-100 p-3 rounded text-xs overflow-auto">{JSON.stringify(v.spec, null, 2)}</pre>
            </div>
          ))}
          {versions.length === 0 && <div className="text-sm text-gray-600">Inga versioner ännu.</div>}
        </div>
      </div>
    </div>
  );
}


