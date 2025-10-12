"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles } from "lucide-react";

export default function BuildBotPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string[]>([]);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [botId, setBotId] = useState<string | null>(null);
  const [widgetSnippet, setWidgetSnippet] = useState<string>("");
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");
  const [botType, setBotType] = useState<'knowledge' | 'lead' | 'support'>("knowledge");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [slackWebhook, setSlackWebhook] = useState<string>("");
  const [avail, setAvail] = useState<any>(null);

  useEffect(() => {
    const start = async () => {
      try { const a = await fetch('/api/integrations/availability'); setAvail(await a.json()); } catch {}
      const consultData = sessionStorage.getItem("executiveConsultation");
      const conversations = sessionStorage.getItem("problemConversations");
      if (!consultData || !conversations) {
        router.push("/business/executive-consultant");
        return;
      }

      try {
        setStatus((s) => [...s, "Startar byggprocess..."]);
        setProgress(10);

        const res = await fetch("/api/bots/build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consult: JSON.parse(consultData),
            conversations: JSON.parse(conversations)
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Build failed");
        setProgress(65);
        setStatus((s) => [...s, "Indexering och konfiguration klar..."]);
        setBotId(data.botId);

        const snRes = await fetch(`/api/bots/snippet?botId=${encodeURIComponent(data.botId)}`);
        const snData = await snRes.json();
        setWidgetSnippet(snData.snippet || "");
        setProgress(90);
        setStatus((s) => [...s, "Klar! Din bot är redo."]);

        // Prepare checkout URL (best-effort)
        try {
          const ch = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: 'bot_monthly', botId: data.botId })
          });
          const chData = await ch.json();
          if (ch.ok && chData.url) setCheckoutUrl(chData.url);
        } catch {}
        setProgress(100);
      } catch (e: any) {
        setStatus((s) => [...s, e.message || "Något gick fel"]);
      }
    };
    start();
  }, [router]);

  const copySnippet = async () => {
    if (!widgetSnippet) return;
    await navigator.clipboard.writeText(widgetSnippet);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 pt-20 pb-20">
        <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-900">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold uppercase">Bygger din bot</h1>
              <p className="text-gray-600">Indexerar källor och förbereder konfiguration</p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-full h-3 overflow-hidden mb-6">
            <div
              className="bg-gray-900 h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ul className="space-y-2 text-sm mb-8">
            {status.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>{s}</span>
              </li>
            ))}
          </ul>

          {botId && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                {botId && (
                  <a href={`/bots/${botId}`} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-50">Öppna publik chat</a>
                )}
                <a href="/analytics" className="px-6 py-3 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-50">Analytics</a>
                {checkoutUrl && (
                <div className="flex justify-end">
                  <a href={checkoutUrl} target="_blank" rel="noreferrer" className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800">Uppgradera</a>
                </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Bot‑typ</label>
                    <select value={botType} onChange={(e) => setBotType(e.target.value as any)} className="w-full border border-gray-200 rounded-lg px-3 py-2">
                      <option value="knowledge">Knowledge/Q&A</option>
                      <option value="lead">Lead‑kvalificering</option>
                      <option value="support">Support‑triage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Webhook (valfritt)</label>
                    <input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Slack Webhook (valfritt)</label>
                    <input value={slackWebhook} onChange={(e) => setSlackWebhook(e.target.value)} placeholder="https://hooks.slack.com/..." className="w-full border border-gray-200 rounded-lg px-3 py-2" />
                  </div>
                </div>
                <div>
                  <button
                    onClick={async () => {
                      if (!botId) return;
                      await fetch('/api/bots/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ botId, type: botType, webhookUrl, slackWebhook, specPatch: { hubspotEnabled: true } })
                      });
                      setStatus((s) => [...s, 'Uppdaterade bottype/webhook']);
                    }}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg"
                  >Spara konfiguration</button>
                </div>
                <h2 className="text-xl font-bold mb-2">Widget‑snippet</h2>
                <p className="text-sm text-gray-600 mb-4">Klistra in i &lt;head&gt; på er webb.</p>
                <div className="bg-gray-900 text-white rounded-xl p-4 relative">
                  <pre className="whitespace-pre-wrap text-sm">{widgetSnippet}</pre>
                  <button
                    onClick={copySnippet}
                    className="absolute top-3 right-3 px-3 py-1 bg-white text-gray-900 rounded-lg text-sm"
                  >
                    {snippetCopied ? "Kopierad" : "Kopiera"}
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push(`/bots/chat?botId=${botId}`)}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
                >
                  Testa i web‑chat
                </button>
                <button
                  onClick={() => router.push("/business/executive-consultant")}
                  className="px-6 py-3 bg-white border-2 border-gray-900 rounded-xl hover:bg-gray-50"
                >
                  Tillbaka
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


