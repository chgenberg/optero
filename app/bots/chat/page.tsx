"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

function ChatInner() {
  const params = useSearchParams();
  const botId = params?.get("botId") || "";
  type ChatMsg = { role: "user" | "assistant"; content: string };
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [brand, setBrand] = useState<{ primaryColor?: string; fontFamily?: string; tone?: string } | null>(null);
  const [botName, setBotName] = useState<string>("Bot");

  useEffect(() => { if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight; }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        if (!botId) return;
        const res = await fetch(`/api/bots/info?botId=${encodeURIComponent(botId)}`);
        const data = await res.json();
        if (data?.spec?.brand) setBrand(data.spec.brand);
        if (data?.name) setBotName(data.name);
        // friendly welcome based on tone
        const tone = data?.spec?.brand?.tone || 'professional';
        const welcome = tone === 'formal' ?
          'God dag! Jag hjälper gärna till. Vad vill du veta?' :
          tone === 'casual' ?
          'Hej! 👋 Hur kan jag hjälpa dig idag?' :
          'Hej! Hur kan jag hjälpa dig idag?';
        setMessages([{ role: 'assistant', content: welcome }]);
      } catch {}
    })();
  }, [botId]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const next: ChatMsg[] = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/bots/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, history: next })
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant" as const, content: data.reply || "(ingen respons)" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: brand?.fontFamily || 'inherit' }}>
      <div className="max-w-3xl mx-auto p-4 sm:p-6 pt-20">
        <h1 className="text-2xl font-bold mb-4">{botName}</h1>
        <div ref={containerRef} className="h-[60vh] bg-white border border-gray-200 rounded-xl p-4 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-xl ${m.role === 'user' ? 'text-white' : ''}`} style={{ backgroundColor: m.role === 'user' ? (brand?.primaryColor || '#111') : '#f3f4f6' }}>{m.content}</div>
            </div>
          ))}
          {loading && <Loader2 className="w-6 h-6 animate-spin text-gray-500" />}
          <div ref={endRef} />
        </div>
        {/* Quick prompts */}
        <div className="mt-3 flex flex-wrap gap-2">
          {["Prissättning", "Funktioner", "Integrationer", "Bokning"].map((q) => (
            <button key={q} onClick={() => setInput(q)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors">{q}</button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key==='Enter' && send()} placeholder="Skriv ett meddelande..." className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl" />
          <button onClick={send} disabled={loading || !input.trim()} className="px-4 py-3 text-white rounded-xl" style={{ backgroundColor: brand?.primaryColor || '#111' }}><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

export default function BotChatTest() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">Laddar...</div>}>
      <ChatInner />
    </Suspense>
  );
}


