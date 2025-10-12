"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, Code, LinkIcon, Copy, CheckCircle, ArrowRight } from "lucide-react";

export default function BuildBotPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string[]>([]);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [botId, setBotId] = useState<string | null>(null);
  const [widgetSnippet, setWidgetSnippet] = useState<string>("");

  useEffect(() => {
    const start = async () => {
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
        setProgress(100);
        setStatus((s) => [...s, "Klar! Din bot är redo."]);
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
              <div>
                <h2 className="text-xl font-bold mb-2">Widget‑snippet</h2>
                <p className="text-sm text-gray-600 mb-4">Klistra in i <head> på er webb.</p>
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


