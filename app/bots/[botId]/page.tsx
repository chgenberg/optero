"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";

export default function BotPublicChat() {
  const params = useParams();
  const botId = (params?.botId as string) || "";
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight; }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: input }];
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 pt-20">
        <h1 className="text-2xl font-bold mb-4">Chatta med bot · Free</h1>
        <div ref={containerRef} className="h-[60vh] bg-white border border-gray-200 rounded-xl p-4 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-xl ${m.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>{m.content}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="mt-4 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key==='Enter' && send()} placeholder="Skriv ett meddelande..." className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl" />
          <button onClick={send} disabled={loading || !input.trim()} className="px-4 py-3 bg-gray-900 text-white rounded-xl"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}


