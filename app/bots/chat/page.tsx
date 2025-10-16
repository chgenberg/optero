"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send, Loader2, Calendar, Bot, Sparkles, ArrowUp, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

function ChatInner() {
  const params = useSearchParams();
  const router = useRouter();
  const botId = params?.get("botId") || "";
  const { locale } = useLanguage();
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
  const [botName, setBotName] = useState<string>("AI Assistant");

  useEffect(() => { if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight; }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        if (!botId) return;
        const res = await fetch(`/api/bots/info?botId=${encodeURIComponent(botId)}`);
        const data = await res.json();
        setBotInfo(data);
        
        if (data?.spec?.brand) {
          setBrand(data.spec.brand);
          // Set bot name
          if (data.spec.brand.botName) {
            setBotName(data.spec.brand.botName);
          }
        }
        
        // Extract company name from URL or use generic name
        const url = data?.spec?.url || data?.companyUrl || "";
        if (url) {
          try {
            const hostname = new URL(url).hostname.replace(/^www\./, '');
            const parts = hostname.split('.');
            const domain = parts[0] || 'Company';
            setCompanyName(domain.charAt(0).toUpperCase() + domain.slice(1));
          } catch {
            setCompanyName('Company');
          }
        } else {
          setCompanyName('Company');
        }
        
        // Welcome message (allow override)
        const tone = data?.spec?.brand?.tone || 'professional';
        const customWelcome = data?.spec?.brand?.welcomeMessage as string | undefined;
        const welcomeByLocale: Record<string, { casual: string; formal: string; default: string }> = {
          en: {
            casual: "Hi! How can I help you today?",
            formal: "Good day. How may I assist you?",
            default: "Hi! How can I help you today?"
          },
          sv: {
            casual: "Hej! Hur kan jag hjälpa dig idag?",
            formal: "God dag! Jag hjälper gärna till. Vad vill du veta?",
            default: "Hej! Hur kan jag hjälpa dig idag?"
          }
        };
        const wl = welcomeByLocale[locale] || welcomeByLocale.en;
        const welcome = customWelcome ? customWelcome : (tone === 'formal' ? wl.formal : tone === 'casual' ? wl.casual : wl.default);
        setMessages([{ role: 'assistant', content: welcome }]);

        // Suggestions (prefer custom quickReplies)
        const customQuick = Array.isArray(data?.spec?.brand?.quickReplies) ? data.spec.brand.quickReplies : [];
        if (customQuick.length > 0) setSuggestions(customQuick.slice(0, 3));
        else {
          const s = await fetch(`/api/bots/suggest?botId=${encodeURIComponent(botId)}&lang=${encodeURIComponent(locale)}`);
          const sj = await s.json();
          if (Array.isArray(sj?.suggestions)) setSuggestions(sj.suggestions);
        }
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
        body: JSON.stringify({ botId, history: next, locale })
      });
      const data = await res.json();
      const fallbackByLocale: Record<string, string> = {
        en: "I couldn't answer that. Please try another question.",
        sv: "Jag kunde inte svara på det. Prova en annan fråga."
      };
      const reply = data.reply || fallbackByLocale[locale] || fallbackByLocale.en;
      setMessages((m) => [...m, { role: "assistant" as const, content: reply }]);
    } catch (err) {
      const errByLocale: Record<string, string> = {
        en: "Technical error. Please try again.",
        sv: "Tekniskt fel. Försök igen."
      };
      setMessages((m) => [...m, { role: "assistant" as const, content: errByLocale[locale] || errByLocale.en }]);
    } finally {
      setLoading(false);
    }
  };

  const calendlyUrl = botInfo?.spec?.calendlyUrl || null;
  const customButtons = (botInfo?.spec?.brand?.buttons as Array<{label:string;url:string}>) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" style={{ fontFamily: brand?.fontFamily || 'system-ui' }}>
      <div className="max-w-3xl mx-auto p-4 md:p-6 pt-12 md:pt-24">
        
        {/* Minimalist Chat Interface */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/dashboard/${botId}`)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Back to dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="relative">
                  {brand?.logoUrl ? (
                    <img 
                      src={brand.logoUrl} 
                      alt="Logo" 
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-contain bg-white p-1"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl flex items-center justify-center">
                      <Bot className="w-6 h-6 md:w-7 md:h-7 text-black" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                </div>
                <div className="flex-1">
                  <h1 className="text-lg md:text-xl font-bold text-white">{botName}</h1>
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Active now
                    </span>
                    <span className="text-gray-600">•</span>
                    <span>{companyName}</span>
                  </p>
                </div>
              </div>
            
              {calendlyUrl && (
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-full hover:bg-gray-100 transition-all text-xs font-medium"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book demo
                </a>
              )}
            </div>
          </div>
          {/* Messages Container */}
          <div ref={containerRef} className="h-[450px] md:h-[500px] overflow-y-auto p-4 md:p-6 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <div 
                    className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${
                      m.role === 'user' 
                        ? 'bg-black text-white rounded-br-sm' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                    style={m.role === 'user' && brand?.primaryColor !== '#000000' ? {
                      backgroundColor: brand.primaryColor
                    } : {}}
                  >
                    <p className="text-sm leading-relaxed">{m.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          
          {/* Custom Buttons */}
          {customButtons.length > 0 && (
            <div className="px-6 py-3 bg-white border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {customButtons.map((b, i) => (
                  <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full text-xs text-gray-700 transition-all">
                    {b.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && messages.length === 1 && (
            <div className="px-4 md:px-6 py-3 bg-gradient-to-b from-transparent to-gray-50">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{locale === 'sv' ? 'Förslag på frågor' : 'Suggested questions'}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((q, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setInput(q); setTimeout(() => send(), 100); }}
                    className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-full text-xs text-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Section */}
          <div className="p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key==='Enter' && !e.shiftKey && send()} 
                placeholder="Type your message..." 
                className="w-full pl-4 pr-12 py-3 md:py-4 bg-white border-2 border-gray-200 focus:border-black rounded-full focus:outline-none transition-all duration-200 text-sm shadow-sm focus:shadow-md"
                disabled={loading}
              />
              <button 
                onClick={send} 
                disabled={loading || !input.trim()} 
                className={`absolute right-2 p-2 md:p-2.5 rounded-full transition-all duration-200 ${
                  loading || !input.trim() 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg hover:scale-105'
                }`}
                style={!loading && input.trim() && brand?.primaryColor !== '#000000' ? {
                  backgroundColor: brand.primaryColor
                } : {}}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-4 md:mt-6 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3" />
            AI trained on {companyName}'s data
            <Sparkles className="w-3 h-3" />
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
