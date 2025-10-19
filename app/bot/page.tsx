"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Upload, Loader2, CheckCircle2, Bot, ArrowRight, Paperclip, Star, Zap, Shield, Settings } from "lucide-react";

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
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const scrapeAbortRef = useRef<AbortController | null>(null);
  const [scrapingComplete, setScrapingComplete] = useState(false);

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
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'integrations'>('general');
  
  // Bot settings state
  const [botSettings, setBotSettings] = useState({
    name: "Your AI Assistant",
    tone: "Professional",
    color: "#000000",
    language: "en",
    logo: null as string | null
  });

  // Integration settings state
  const [integrations, setIntegrations] = useState({
    shopify: { domain: '', accessToken: '', enabled: false },
    hubspot: { accessToken: '', enabled: false },
    zendesk: { domain: '', email: '', apiToken: '', enabled: false },
    centra: { apiBaseUrl: '', storeId: '', accessToken: '', enabled: false }
  });

  // Load bot settings when bot is created
  useEffect(() => {
    // Check if embedded and auto-open modal
    const params = new URLSearchParams(window.location.search);
    if (params.get('embedded') === 'true') {
      setIsEmbedded(true);
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (botId) {
      fetch(`/api/bots/settings?botId=${botId}`)
        .then(res => res.json())
        .then(data => {
          if (data.settings) {
            setBotSettings(data.settings);
          }
        })
        .catch(console.error);
    }
  }, [botId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const startScrape = async (targetUrl: string) => {
    try {
      setScraping(true);
      setScrapeProgress(0);
      setScrapingComplete(false);
      
      // Progress animation: 0-100% over 1.5 minutes (90 seconds)
      const startTime = Date.now();
      const duration = 90000; // 90 seconds
      let progressInterval: NodeJS.Timeout;
      
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 99);
        setScrapeProgress(Math.round(progress));
        
        if (progress >= 99) {
          clearInterval(progressInterval);
        }
      }, 100);
      
      const ctrl = new AbortController();
      scrapeAbortRef.current = ctrl;
      const res = await fetch("/api/business/deep-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
        signal: ctrl.signal
      });
      const data = (await res.json()) as ScrapeResult;
      
      // Scraping complete - jump to 100%
      setScrapingComplete(true);
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
        body: JSON.stringify({ 
          botId, 
          history: [...chatMessages, { role: "user", content: msg }],
          locale: botSettings.language,
          tone: botSettings.tone
        })
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
      <>
        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Bot Settings</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setSettingsTab('general')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                      settingsTab === 'general'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setSettingsTab('integrations')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                      settingsTab === 'integrations'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Integrations
                  </button>
                </div>

                {settingsTab === 'general' && (
                  <div className="space-y-6">
                  {/* Bot Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bot Name
                    </label>
                    <input
                      type="text"
                      value={botSettings.name}
                      onChange={(e) => setBotSettings({ ...botSettings, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Professional', 'Friendly', 'Casual', 'Formal'].map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setBotSettings({ ...botSettings, tone })}
                          className={`px-4 py-3 border rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                            botSettings.tone === tone 
                              ? 'bg-black text-white border-black' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {['#000000', '#0084FF', '#44BEC7', '#FA3C4C', '#7646FF', '#20CE66'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setBotSettings({ ...botSettings, color })}
                            className={`w-10 h-10 rounded-full border-2 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                              botSettings.color.toUpperCase() === color ? 'border-black ring-2 ring-black ring-offset-2' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={botSettings.color}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                              setBotSettings({ ...botSettings, color: value });
                            }
                          }}
                          placeholder="#000000"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                        />
                        <div 
                          className="w-10 h-10 rounded-xl border-2 border-gray-200"
                          style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(botSettings.color) ? botSettings.color : '#000000' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { code: 'en', name: 'English' },
                        { code: 'sv', name: 'Svenska' },
                        { code: 'es', name: 'Español' },
                        { code: 'fr', name: 'Français' }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setBotSettings({ ...botSettings, language: lang.code })}
                          className={`px-4 py-3 border rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                            botSettings.language === lang.code 
                              ? 'bg-black text-white border-black' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>

                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bot Logo
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload logo</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Connect your business tools to enable your bot to fetch real-time data and provide better answers.
                    </p>

                    {/* Shopify */}
                    <div className="border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">Shopify</h3>
                            <p className="text-xs text-gray-500">E-commerce platform</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={integrations.shopify.enabled}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              shopify: { ...integrations.shopify, enabled: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                      {integrations.shopify.enabled && (
                        <div className="space-y-3 mt-3">
                          <input
                            type="text"
                            placeholder="Store domain (e.g., mystore.myshopify.com)"
                            value={integrations.shopify.domain}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              shopify: { ...integrations.shopify, domain: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <input
                            type="password"
                            placeholder="Access Token"
                            value={integrations.shopify.accessToken}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              shopify: { ...integrations.shopify, accessToken: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      )}
                    </div>

                    {/* HubSpot */}
                    <div className="border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">H</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">HubSpot</h3>
                            <p className="text-xs text-gray-500">CRM & Marketing</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={integrations.hubspot.enabled}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              hubspot: { ...integrations.hubspot, enabled: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                      {integrations.hubspot.enabled && (
                        <div className="space-y-3 mt-3">
                          <input
                            type="password"
                            placeholder="API Access Token"
                            value={integrations.hubspot.accessToken}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              hubspot: { ...integrations.hubspot, accessToken: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      )}
                    </div>

                    {/* Zendesk */}
                    <div className="border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Z</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">Zendesk</h3>
                            <p className="text-xs text-gray-500">Customer Support</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={integrations.zendesk.enabled}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              zendesk: { ...integrations.zendesk, enabled: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                      {integrations.zendesk.enabled && (
                        <div className="space-y-3 mt-3">
                          <input
                            type="text"
                            placeholder="Subdomain (e.g., company.zendesk.com)"
                            value={integrations.zendesk.domain}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              zendesk: { ...integrations.zendesk, domain: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            value={integrations.zendesk.email}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              zendesk: { ...integrations.zendesk, email: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <input
                            type="password"
                            placeholder="API Token"
                            value={integrations.zendesk.apiToken}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              zendesk: { ...integrations.zendesk, apiToken: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      )}
                    </div>

                    {/* Centra */}
                    <div className="border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">C</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">Centra</h3>
                            <p className="text-xs text-gray-500">Headless Commerce</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={integrations.centra.enabled}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              centra: { ...integrations.centra, enabled: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                      {integrations.centra.enabled && (
                        <div className="space-y-3 mt-3">
                          <input
                            type="text"
                            placeholder="API Base URL"
                            value={integrations.centra.apiBaseUrl}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              centra: { ...integrations.centra, apiBaseUrl: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <input
                            type="text"
                            placeholder="Store ID"
                            value={integrations.centra.storeId}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              centra: { ...integrations.centra, storeId: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <input
                            type="password"
                            placeholder="Access Token"
                            value={integrations.centra.accessToken}
                            onChange={(e) => setIntegrations({
                              ...integrations,
                              centra: { ...integrations.centra, accessToken: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={async () => {
                    if (botId) {
                      try {
                        // Save general settings
                        await fetch('/api/bots/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ botId, settings: botSettings })
                        });

                        // Save integrations
                        if (settingsTab === 'integrations') {
                          await fetch('/api/integrations/save', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ botId, integrations })
                          });
                        }

                        setShowSettings(false);
                      } catch (e) {
                        console.error('Failed to save settings:', e);
                      }
                    }
                  }}
                  className="w-full mt-8 px-6 py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Save {settingsTab === 'integrations' ? 'Integrations' : 'Settings'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="w-full h-screen md:max-w-4xl md:h-[700px] bg-white md:rounded-xl shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: botSettings.color }}
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-gray-900">{botSettings.name}</h1>
                    <p className="text-xs text-gray-500">Active now</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => window.location.href = "/"}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
              <div className="space-y-2">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role === "assistant" && (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: botSettings.color }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[70%] ${msg.role === "user" ? "order-1" : ""}`}>
                      <div 
                        className={`rounded-2xl px-4 py-2 ${
                          msg.role === "user" 
                            ? "text-white" 
                            : "bg-gray-200 text-gray-900"
                        }`}
                        style={msg.role === "user" ? { backgroundColor: botSettings.color } : {}}
                      >
                        {msg.role === "assistant" ? (
                          <div 
                            className="text-sm prose prose-sm max-w-none prose-p:my-2 prose-strong:font-bold prose-ul:my-2 prose-li:my-1"
                            dangerouslySetInnerHTML={{ __html: msg.content }}
                          />
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {chatLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: botSettings.color }}
                    >
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-200 rounded-2xl px-4 py-2">
                      <motion.div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{
                              duration: 1.4,
                              repeat: Infinity,
                              delay: i * 0.2
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
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => uploadInChatRef.current?.click()} 
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
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
                    placeholder="Type a message..."
                    className="w-full bg-gray-100 text-gray-900 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-2 placeholder-gray-500"
                  />
                  <button
                    onClick={sendChat}
                    disabled={!chatInput.trim() || chatLoading}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full disabled:opacity-40 transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: chatInput.trim() && !chatLoading ? botSettings.color : '#e5e7eb',
                      color: chatInput.trim() && !chatLoading ? 'white' : '#9ca3af'
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - only show if not embedded */}
      {!isEmbedded && (
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
      )}

      {/* Landing */}
      {!open && !isEmbedded && (
        <div className="min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl w-full"
          >
            {/* Box with pulsating shadow */}
            <motion.div
              className="relative bg-white border-2 border-black rounded-2xl p-12 text-center"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(0,0,0,0.1)",
                  "0 0 40px rgba(0,0,0,0.15)",
                  "0 0 20px rgba(0,0,0,0.1)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
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
                  { Icon: Star, text: "Free" },
                  { Icon: Zap, text: "Easy setup" },
                  { Icon: Shield, text: "Super safe" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <item.Icon className="w-5 h-5 text-black" />
                    <span className="font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
                        <div className="mb-6 p-6 bg-black rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Loader2 className="w-5 h-5 animate-spin text-white" />
                              <span className="font-medium text-white">Analyzing your website...</span>
                            </div>
                            <span className="text-sm font-medium text-white">{scrapeProgress}%</span>
                          </div>
                          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                            <motion.div
                              className="bg-gray-700 h-3 rounded-full relative"
                              initial={{ width: 0 }}
                              animate={{ width: `${scrapeProgress}%` }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div
                                className="absolute inset-0 bg-gray-900/20"
                                animate={{ x: ["0%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              />
                            </motion.div>
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