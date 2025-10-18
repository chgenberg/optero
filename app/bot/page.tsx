"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Upload, Loader2, CheckCircle2 } from "lucide-react";

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
      const ctrl = new AbortController();
      scrapeAbortRef.current = ctrl;
      const res = await fetch("/api/business/deep-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
        signal: ctrl.signal
      });
      const data = (await res.json()) as ScrapeResult;
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
      const pages = scrapeResult?.pages || [];
      const documentFiles = uploadFiles.map((f) => f.name);
      const consult = {
        url,
        pages,
        websiteSummary: scrapeResult?.analysis || {},
        documentsContent: uploadText || "",
        documentFiles,
        userEmail: email,
        botType: "knowledge",
        botSubtype: "pro"
      };
      const res = await fetch("/api/bots/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consult })
      });
      const data = await res.json();
      if (data?.botId) {
        setBotId(data.botId);
        // welcome message
        setChatMessages([{ role: "assistant", content: "Hello! I am your personal company assistant. How can I help today?" }]);
        setStep(2);
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Pulsating shadow */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{ filter: "blur(20px)", background: "rgba(0,0,0,0.1)" }}
            animate={{ opacity: [0.7, 0.4, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
          <div className="relative bg-white border-2 border-black rounded-3xl p-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-black">Create your personal agent</h1>
            <motion.button
              onClick={onStartHere}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={{ boxShadow: ["0 0 0 0 rgba(0,0,0,0.6)", "0 0 0 12px rgba(0,0,0,0)"] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-full font-semibold"
            >
              Start here
            </motion.button>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              {["Free", "Easy-setup", "Super Safe"].map((t) => (
                <span key={t} className="px-3 py-1 rounded-full border text-sm">{t}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

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
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="font-bold">Personal Agent Setup</h3>
                <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>

              {step === 0 && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="you@company.com" className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company URL</label>
                    <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="example.com" className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" checked={consent} onChange={(e)=>setConsent(e.target.checked)} />
                    <span>I agree to the privacy policy and processing for building my agent.</span>
                  </label>
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-gray-500">We start analyzing your site when you continue.</div>
                    <button onClick={handleNextFromStep0} disabled={!email || !url || !consent} className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-40">Next</button>
                  </div>
                  {scraping && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-700"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing website…</div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="p-6 space-y-4">
                  <p className="text-gray-700">Upload any documents the assistant should know (PDF, Word, Excel, Keynote).</p>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:bg-gray-50">
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-sm">Drag & drop or click to select files</span>
                    <input className="hidden" type="file" multiple onChange={(e)=>handleFilesSelected(e.target.files)} />
                  </label>
                  {uploading && <div className="text-sm text-gray-700 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Processing files…</div>}
                  {uploadFiles.length>0 && (
                    <div className="text-sm text-green-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> {uploadFiles.length} file(s) ready.</div>
                  )}
                  <div className="flex items-center justify-end pt-2">
                    <button onClick={handleBuildAndChat} disabled={building} className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-40">{building ? 'Preparing…' : 'Start chatting'}</button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="p-0">
                  <div className="px-5 py-3 border-b flex items-center justify-between">
                    <div className="font-semibold">Your Assistant</div>
                    {botId && <div className="text-xs text-gray-500">Bot ID: {botId.slice(0,6)}…</div>}
                  </div>
                  <div className="h-[420px] flex flex-col">
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatMessages.map((m,i)=> (
                        <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${m.role==='user'?'bg-black text-white':'bg-gray-100'}`}>{m.content}</div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start"><div className="bg-gray-100 px-3 py-2 rounded-2xl text-sm">Typing…</div></div>
                      )}
                    </div>
                    <div className="p-3 border-t">
                      <div className="flex items-center gap-2">
                        <button onClick={()=>uploadInChatRef.current?.click()} className="px-3 py-2 border rounded-lg text-sm">Attach</button>
                        <input ref={uploadInChatRef} type="file" multiple className="hidden" onChange={async (e)=>{
                          const files = e.target.files; if (!files || !botId) return;
                          // reuse upload-documents to parse, then ingest
                          const fd = new FormData(); Array.from(files).forEach(f=>fd.append('files', f));
                          try {
                            const up = await fetch('/api/business/upload-documents', { method: 'POST', body: fd });
                            const upj = await up.json();
                            if (upj?.content) {
                              await fetch('/api/bots/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId, title: 'Chat upload', content: upj.content, source: 'chat' }) });
                              setChatMessages((m)=>[...m, { role: 'assistant', content: 'Thanks! I learned from your files and will use them in my answers.' }]);
                            }
                          } catch {}
                          e.currentTarget.value = '';
                        }} />
                        <div className="relative flex-1">
                          <input value={chatInput} onChange={(e)=>setChatInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendChat(); } }} placeholder="Ask anything about your company…" className="w-full border rounded-full px-4 py-2 pr-10" />
                          <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full disabled:opacity-40"><Send className="w-4 h-4"/></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


