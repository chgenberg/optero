"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Upload, Loader2, CheckCircle2, Bot, ArrowRight, Paperclip } from "lucide-react";

interface ScrapeResult {
  success?: boolean;
  url?: string;
  pagesScraped?: number;
  pages?: { url: string; title: string; text: string }[];
  analysis?: any;
}

export default function PersonalAgentLanding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const scrapeAbortRef = useRef<AbortController | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadText, setUploadText] = useState<string>("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const [building, setBuilding] = useState(false);
  const [botId, setBotId] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const uploadInChatRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const startScrape = async (targetUrl: string) => {
    try {
      setScraping(true);
      setScrapeProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setScrapeProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 500);
      
      const ctrl = new AbortController();
      scrapeAbortRef.current = ctrl;
      const res = await fetch("/api/business/deep-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
        signal: ctrl.signal
      });
      const data = (await res.json()) as ScrapeResult;
      
      clearInterval(progressInterval);
      setScrapeProgress(100);
      setScrapeResult(data);
    } catch (e) {
      // ignore, user can retry
    } finally {
      setScraping(false);
      scrapeAbortRef.current = null;
    }
  };

  const onStartHere = () => {
    setOpen(true);
    setStep(0);
  };

  const handleNextFromStep0 = async () => {
    if (!email || !url || !consent) return;
    // Kick off scraping in background
    startScrape(url);
    setStep(1);
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/business/upload-documents", { method: "POST", body: fd });
      const data = await res.json();
      if (data?.content) setUploadText(data.content);
      setUploadFiles(Array.from(files));
    } catch {}
    finally { setUploading(false); }
  };

  const handleBuildAndChat = async () => {
    if (building) return;
    setBuilding(true);
    try {
      // Wait for scrape to finish if still running
      if (scraping) {
        // simple polling until scraping state flips
        while (scraping) { // eslint-disable-line no-constant-condition
          await new Promise((r) => setTimeout(r, 300));
        }
      }
      const res = await fetch("/api/bots/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consult: {
            url,
            pages: scrapeResult?.pages || [],
            websiteSummary: scrapeResult?.analysis || {},
            documentsContent: uploadText,
            documentFiles: uploadFiles.map((f) => f.name),
            userEmail: email,
            botType: "knowledge",
            botSubtype: "pro"
          }
        })
      });
      const data = await res.json();
      if (data?.botId) {
        setBotId(data.botId);
        // Send welcome email
        try {
          await fetch("/api/send-welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, botId: data.botId })
          });
        } catch {}
        setStep(2);
        setChatMessages([
          { role: "assistant", content: "Hi! I'm your personal AI assistant. I've learned everything about your company. Ask me anything!" }
        ]);
      }
    } catch {}
    finally { setBuilding(false); }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !botId || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((m) => [...m, { role: "user", content: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/bots/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, history: [...chatMessages, { role: "user", content: msg }] })
      });
      const data = await res.json();
      const reply = data?.reply || "I couldn't answer that. Please try another question.";
      setChatMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages((m) => [...m, { role: "assistant", content: "Technical error. Please try again." }]);
    } finally { setChatLoading(false); }
  };

  if (botId && step === 2) {
    // Full chat interface
    return (
      <div className="h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Your AI Assistant</h1>
                <p className="text-sm text-gray-600">Always ready to help</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = "/"}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user" 
                      ? "bg-gray-100" 
                      : "bg-white border border-gray-200"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {chatLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <motion.div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <button 
              onClick={() => uploadInChatRef.current?.click()} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              ref={uploadInChatRef} 
              type="file" 
              multiple 
              className="hidden" 
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || !botId) return;
                const fd = new FormData();
                Array.from(files).forEach(f => fd.append('files', f));
                try {
                  const up = await fetch('/api/business/upload-documents', { method: 'POST', body: fd });
                  const upj = await up.json();
                  if (upj?.content) {
                    await fetch('/api/bots/ingest', { 
                      method: 'POST', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify({ botId, title: 'Chat upload', content: upj.content, source: 'chat' }) 
                    });
                    setChatMessages((m) => [...m, { role: 'assistant', content: 'Thanks! I learned from your files and will use them in my answers.' }]);
                  }
                } catch {}
                e.currentTarget.value = '';
              }} 
            />
            <div className="relative flex-1">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }}}
                placeholder="Ask anything about your company…"
                className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim() || chatLoading}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full disabled:opacity-40 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-8 py-6 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">MENDIO</h1>
          <button
            onClick={() => window.location.href = "/"}
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            Back to home
          </button>
        </div>
      </div>

      {/* Landing */}
      {!open && (
        <div className="min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl w-full"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-24 h-24 bg-black rounded-full mx-auto mb-8 flex items-center justify-center relative"
            >
              <Bot className="w-12 h-12 text-white" />
              <motion.div
                className="absolute inset-0 bg-black rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Title */}
            <h2 className="text-5xl font-bold mb-6 tracking-tight">
              Create your personal agent
            </h2>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Transform your company knowledge into an intelligent AI assistant. 
              Upload documents, connect your website, and start chatting in minutes.
            </p>
            
            {/* CTA Button */}
            <motion.button
              onClick={onStartHere}
              className="bg-black text-white px-10 py-5 rounded-full font-medium text-lg inline-flex items-center gap-3 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start here
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
            
            {/* Features */}
            <div className="flex justify-center gap-8 mt-12">
              {[
                { icon: "✨", text: "Free" },
                { icon: "⚡", text: "Easy setup" },
                { icon: "🔒", text: "Super safe" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal flow */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {step === 0 && "Get Started"}
                  {step === 1 && "Add Your Knowledge"}
                  {step === 2 && "Your Assistant is Ready"}
                </h3>
                <button
                  onClick={() => {
                    setOpen(false);
                    if (scrapeAbortRef.current) scrapeAbortRef.current.abort();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* Step 0: Email & URL */}
                  {step === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company website
                          </label>
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://yourcompany.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        
                        <label className="flex items-start gap-3 mt-6">
                          <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="mt-1"
                          />
                          <span className="text-sm text-gray-600">
                            I agree to the{" "}
                            <a href="/integritetspolicy" target="_blank" className="underline">
                              privacy policy
                            </a>
                            {" "}and terms of service
                          </span>
                        </label>
                      </div>
                      
                      <button
                        onClick={handleNextFromStep0}
                        disabled={!email || !url || !consent}
                        className="mt-6 w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      >
                        Next
                      </button>
                    </motion.div>
                  )}

                  {/* Step 1: Upload */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {scraping && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-medium">Analyzing your website...</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-black h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${scrapeProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {!scraping && scrapeResult && (
                        <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-green-800">
                            Successfully analyzed {scrapeResult.pagesScraped || 0} pages
                          </span>
                        </div>
                      )}
                      
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add("border-black");
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove("border-black");
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove("border-black");
                          handleFilesSelected(e.dataTransfer.files);
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.multiple = true;
                          input.onchange = (e) => handleFilesSelected((e.target as HTMLInputElement).files);
                          input.click();
                        }}
                      >
                        {uploading ? (
                          <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin" />
                        ) : (
                          <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                        )}
                        <p className="font-medium mb-1">
                          Drop documents here or click to upload
                        </p>
                        <p className="text-sm text-gray-500">
                          PDF, Word, Excel, PowerPoint, Text files
                        </p>
                      </div>
                      
                      {uploadFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {uploadFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span>{f.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <button
                        onClick={handleBuildAndChat}
                        disabled={building || scraping}
                        className="mt-6 w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                      >
                        {building ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Building your assistant...
                          </>
                        ) : (
                          <>
                            Start chatting
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}