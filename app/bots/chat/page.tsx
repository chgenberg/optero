"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Loader2, Calendar } from "lucide-react";

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
  const [brand, setBrand] = useState<any>(null);
  const [botInfo, setBotInfo] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => { if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight; }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        if (!botId) return;
        const res = await fetch(`/api/bots/info?botId=${encodeURIComponent(botId)}`);
        const data = await res.json();
        setBotInfo(data);
        
        if (data?.spec?.brand) setBrand(data.spec.brand);
        
        // Extract company name from URL or use generic name
        const url = data?.spec?.url || data?.companyUrl || "";
        if (url) {
          try {
            const hostname = new URL(url).hostname.replace(/^www\./, '');
            const parts = hostname.split('.');
            const domain = parts[0] || 'Företaget';
            setCompanyName(domain.charAt(0).toUpperCase() + domain.slice(1));
          } catch {
            setCompanyName('Företaget');
          }
        } else {
          setCompanyName('Företaget');
        }
        
        // Welcome message
        const tone = data?.spec?.brand?.tone || 'professional';
        const welcome = tone === 'formal' ?
          'God dag! Jag hjälper gärna till. Vad vill du veta?' :
          tone === 'casual' ?
          'Hej! 👋 Hur kan jag hjälpa dig idag?' :
          'Hej! Hur kan jag hjälpa dig idag?';
        setMessages([{ role: 'assistant', content: welcome }]);
        
        // Suggestions
        const s = await fetch(`/api/bots/suggest?botId=${encodeURIComponent(botId)}`);
        const sj = await s.json();
        if (Array.isArray(sj?.suggestions)) setSuggestions(sj.suggestions);
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
      const reply = data.reply || "Jag kunde inte svara på det. Prova en annan fråga.";
      setMessages((m) => [...m, { role: "assistant" as const, content: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant" as const, content: "Tekniskt fel. Försök igen." }]);
    } finally {
      setLoading(false);
    }
  };

  const calendlyUrl = botInfo?.spec?.calendlyUrl || null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ fontFamily: brand?.fontFamily || 'system-ui' }}>
      <div className="max-w-4xl mx-auto p-6 pt-24">
        
        {/* Premium Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {brand?.logoUrl && (
                <img src={brand.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-contain shadow-sm" />
              )}
              <div>
                <h1 className="text-2xl font-light text-gray-900">{companyName}</h1>
                <p className="text-sm text-gray-500">Chatbot · {botInfo?.type === 'lead' ? 'Leadkvalificering' : botInfo?.type === 'support' ? 'Kundsupport' : botInfo?.type === 'workflow' ? 'Arbetsflöden' : 'Kunskap'}</p>
              </div>
            </div>
            
            {calendlyUrl && (
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all text-sm"
              >
                <Calendar className="w-4 h-4" />
                Boka demo
              </a>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div ref={containerRef} className="h-[500px] overflow-y-auto p-6 space-y-4 scrollbar-minimal">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div 
                  className={`px-5 py-3 rounded-2xl max-w-[75%] shadow-sm ${m.role === 'user' ? 'rounded-tr-none text-white' : 'rounded-tl-none'}`} 
                  style={{ 
                    backgroundColor: m.role === 'user' ? (brand?.primaryColor || '#111') : '#f3f4f6',
                    color: m.role === 'user' ? 'white' : '#111'
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-5 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          
          {/* Suggestions */}
          {suggestions.length > 0 && messages.length === 1 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Föreslagna frågor:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((q, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setInput(q); setTimeout(() => send(), 100); }}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-full text-xs text-gray-700 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input */}
          <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key==='Enter' && !e.shiftKey && send()} 
                placeholder="Skriv ett meddelande..." 
                className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                disabled={loading}
              />
              <button 
                onClick={send} 
                disabled={loading || !input.trim()} 
                className="px-5 py-3 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2" 
                style={{ backgroundColor: brand?.primaryColor || '#111' }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Denna bot är tränad på {companyName}s webbplats och dokument
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BotChatTest() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Laddar bot...</p>
        </div>
      </div>
    }>
      <ChatInner />
    </Suspense>
  );
}
