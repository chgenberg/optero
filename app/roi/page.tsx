"use client";

import { useState } from "react";

export default function ROIPage() {
  const [inputs, setInputs] = useState({ mql: "400", tickets: "600", aht: "18", conv: "2.1" });
  const [advanced, setAdvanced] = useState({ leadBoostPct: "20", deflectionRate: "25", ahtReductionPct: "15", convLiftPct: "10", grossMarginPct: "70", cacPerMQL: "30", agentCostPerHour: "25" });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const estimate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const body = {
        mql: parseFloat(inputs.mql || "0"),
        tickets: parseFloat(inputs.tickets || "0"),
        aht: parseFloat(inputs.aht || "0"),
        conv: parseFloat(inputs.conv || "0"),
        leadBoostPct: parseFloat(advanced.leadBoostPct || "20"),
        deflectionRate: parseFloat(advanced.deflectionRate || "25"),
        ahtReductionPct: parseFloat(advanced.ahtReductionPct || "15"),
        convLiftPct: parseFloat(advanced.convLiftPct || "10"),
        grossMarginPct: parseFloat(advanced.grossMarginPct || "70"),
        cacPerMQL: parseFloat(advanced.cacPerMQL || "30"),
        agentCostPerHour: parseFloat(advanced.agentCostPerHour || "25"),
      };
      const r = await fetch('/api/roi/estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      setResult(d);
    } finally {
      setLoading(false);
    }
  };

  const Input = ({ label, name, state, setState }: any) => (
    <label className="text-sm">
      <span className="block mb-1 font-semibold">{label}</span>
      <input value={state[name]} onChange={(e) => setState({ ...state, [name]: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2" />
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto p-6 pt-20 pb-20">
        <h1 className="text-3xl font-bold mb-6">ROI‑kalkylator</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6 space-y-3">
            <h2 className="text-xl font-bold mb-2">Ingångsvärden</h2>
            <Input label="MQL/mån" name="mql" state={inputs} setState={setInputs} />
            <Input label="Supportärenden/mån" name="tickets" state={inputs} setState={setInputs} />
            <Input label="Genomsnittlig AHT (min)" name="aht" state={inputs} setState={setInputs} />
            <Input label="Konvertering (%)" name="conv" state={inputs} setState={setInputs} />
          </div>
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-6 grid grid-cols-2 gap-3">
            <h2 className="text-xl font-bold col-span-2">Antaganden</h2>
            <Input label="Lead‑boost (%)" name="leadBoostPct" state={advanced} setState={setAdvanced} />
            <Input label="Deflection (%)" name="deflectionRate" state={advanced} setState={setAdvanced} />
            <Input label="AHT‑reduktion (%)" name="ahtReductionPct" state={advanced} setState={setAdvanced} />
            <Input label="Conv‑lyft (%)" name="convLiftPct" state={advanced} setState={setAdvanced} />
            <Input label="Bruttomarginal (%)" name="grossMarginPct" state={advanced} setState={setAdvanced} />
            <Input label="CAC per MQL" name="cacPerMQL" state={advanced} setState={setAdvanced} />
            <Input label="Agentkostnad/h" name="agentCostPerHour" state={advanced} setState={setAdvanced} />
          </div>
        </div>
        <div className="mt-6">
          <button onClick={estimate} disabled={loading} className="px-6 py-3 bg-gray-900 text-white rounded-xl">Beräkna</button>
        </div>

        {result && (
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <div className="text-sm text-gray-600">MQL efter</div>
              <div className="text-3xl font-bold">{result.improvements?.improvedMQL}</div>
            </div>
            <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <div className="text-sm text-gray-600">Deflection (ärenden)</div>
              <div className="text-3xl font-bold">{result.improvements?.deflected}</div>
            </div>
            <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
              <div className="text-sm text-gray-600">EBIT‑påverkan</div>
              <div className="text-3xl font-bold">{Math.round(result.estimates?.ebitImpact || 0)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


