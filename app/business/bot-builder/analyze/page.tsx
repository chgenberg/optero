"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Info, Check, X } from "lucide-react";

export default function AnalyzeProblem() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [selectedBot, setSelectedBot] = useState("");
  const [showInfoFor, setShowInfoFor] = useState<string | null>(null);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState<string | null>(null);
  const [infoTab, setInfoTab] = useState<'overview'|'setup'|'integrations'|'api'|'security'>('overview');

  useEffect(() => {
    const analyzeWebsite = async () => {
      const url = sessionStorage.getItem("botWebsiteUrl");
      if (!url) {
        router.push("/business/bot-builder/identify");
        return;
      }

      // Use cached analysis if still valid
      try {
        const cachedStr = sessionStorage.getItem("botDeepAnalysis");
        if (cachedStr) {
          try {
            const cached = JSON.parse(cachedStr);
            const ts = cached?._ts as number | undefined;
            const fresh = !ts || (Date.now() - ts < 45 * 60 * 1000);
            if (cached?.url === url && fresh) {
              setResult(cached);
              setAnalyzing(false);
              return;
            }
          } catch {}
        }
      } catch {}

      try {
        const documentContent = sessionStorage.getItem("botDocuments") || "";
        
        const res = await fetch("/api/business/deep-scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            url,
            documentContent
          }),
        });
        
        const data = await res.json();
        setResult(data);
        
        try { 
          const withTs = { ...data, _ts: Date.now() };
          sessionStorage.setItem("botDeepAnalysis", JSON.stringify(withTs)); 
          sessionStorage.setItem("botBuilder_scrape", JSON.stringify(withTs));
        } catch {}
      } catch (error) {
        console.error("Analysis error:", error);
      } finally {
        setTimeout(() => setAnalyzing(false), 1500);
      }
    };

    analyzeWebsite();
  }, [router]);

  const botRecommendations = [
    {
      id: "customer-support",
      title: "CUSTOMER SUPPORT",
      type: "support",
      description: "Automate 60% of support tickets with AI",
      metrics: ["24/7 availability", "< 5s response time", "90% CSAT"],
      effort: "5 min",
      savings: "120K/yr"
    },
    {
      id: "lead-qualification",
      title: "LEAD QUALIFICATION",
      type: "lead",
      description: "Qualify leads and book meetings automatically",
      metrics: ["3x more qualified leads", "Automatic CRM sync", "Personalized"],
      effort: "10 min",
      savings: "250K/yr"
    },
    {
      id: "booking",
      title: "BOOKING SYSTEM",
      type: "workflow",
      subtype: "booking",
      description: "Eliminate double booking and manual handling",
      metrics: ["Calendar integration", "SMS reminders", "Automatic confirmation"],
      effort: "15 min",
      savings: "80K/yr"
    },
    {
      id: "knowledge-base",
      title: "KNOWLEDGE BASE",
      type: "knowledge",
      description: "Answer product questions instantly",
      metrics: ["RAG-powered answers", "Source citations", "Always up-to-date"],
      effort: "5 min",
      savings: "150K/yr"
    },
    {
      id: "ecommerce-assistant",
      title: "E-COMMERCE ASSISTANT",
      type: "workflow",
      subtype: "ecommerce",
      description: "Help customers find products and track orders",
      metrics: ["Product recommendations", "Order tracking", "Return handling"],
      effort: "20 min",
      savings: "200K/yr"
    },
    {
      id: "hr-screening",
      title: "HR SCREENING",
      type: "workflow",
      subtype: "hr_screening",
      description: "Pre-screen candidates and schedule interviews",
      metrics: ["Automated screening", "Interview scheduling", "Candidate scoring"],
      effort: "15 min",
      savings: "180K/yr"
    }
  ];

  const advancedSolutions = [
    {
      title: "VOICE AI AGENT",
      description: "Phone support with natural conversations",
      complexity: "2-4 WEEKS SETUP",
      details: {
        what: "An AI that handles phone calls like a human agent. Understands context, handles interruptions, and transfers to humans when needed.",
        benefits: [
          "Handle 80% of phone calls automatically",
          "24/7 availability in multiple languages",
          "Natural conversations with emotion detection",
          "Seamless handoff to human agents"
        ],
        examples: "Restaurant bookings, appointment confirmations, first-line support, order status inquiries."
      }
    },
    {
      title: "WORKFLOW AUTOMATION",
      description: "Connect all your business systems",
      complexity: "1-3 WEEKS SETUP",
      details: {
        what: "Custom AI workflows that connect your CRM, ERP, email, and other systems. Automates complex multi-step processes.",
        benefits: [
          "Eliminate manual data entry",
          "Automatic task routing and assignment",
          "Real-time sync across all systems",
          "Custom business logic implementation"
        ],
        examples: "Quote-to-cash automation, employee onboarding, contract processing, inventory management."
      }
    },
    {
      title: "AI DATA ANALYST",
      description: "Ask questions about your data in plain language",
      complexity: "2-3 WEEKS SETUP",
      details: {
        what: "Connect your databases and ask questions in natural language. Get instant insights, reports, and visualizations.",
        benefits: [
          "No SQL knowledge required",
          "Real-time data analysis",
          "Automatic report generation",
          "Predictive analytics and trends"
        ],
        examples: "Sales performance analysis, customer behavior insights, financial reporting, inventory optimization."
      }
    }
  ];

  const handleSelectBot = (botId: string, botType: string, botSubtype?: string) => {
    setSelectedBot(botId);
    sessionStorage.setItem("selectedBotId", botId);
    sessionStorage.setItem("selectedBotType", botType);
    if (botSubtype) {
      sessionStorage.setItem("selectedBotSubtype", botSubtype);
    }
  };

  const handleContinue = () => {
    if (selectedBot) {
      router.push("/business/bot-builder/customize");
    }
  };

  const handleConsultation = () => {
    router.push("/contact");
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div 
              className="absolute inset-0 border-4 border-gray-300 rounded-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-4 border-4 border-gray-200 rounded-xl"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-8 border-4 border-gray-100 rounded-lg"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-wider text-black mb-2">
            ANALYZING YOUR BUSINESS
          </h2>
          <p className="text-gray-600 uppercase tracking-wider text-sm">
            PROCESSING WEBSITE AND DOCUMENTS...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Progress */}
        <div className="flex justify-center mb-20">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-green-500 text-white font-bold text-xl flex items-center justify-center rounded-2xl shadow-xl">
              <Check className="w-6 h-6" />
            </div>
            <div className="w-24 h-[2px] bg-gray-300" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-black text-white font-bold text-xl flex items-center justify-center rounded-2xl shadow-xl"
            >
              02
            </motion.div>
            <div className="w-24 h-[2px] bg-gray-300" />
            <div className="w-16 h-16 bg-white text-gray-400 font-bold text-xl flex items-center justify-center rounded-2xl border-2 border-gray-200">
              03
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold uppercase tracking-wider text-black mb-4">
              SELECT YOUR SOLUTION
            </h1>
            <p className="text-gray-600 uppercase tracking-wider text-sm">
              STEP 02 — CHOOSE YOUR AI AUTOMATION
            </p>
          </div>

          {/* AI Insights */}
          {result?.analysis && (
            <div className="mb-16 grid md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="minimal-card animate-pulse-shadow"
              >
                <p className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-4">
                  AI INSIGHTS FROM YOUR WEBSITE
                </p>
                <p className="text-lg text-gray-800 leading-relaxed mb-4">
                  {result.analysis.description || 'Analyzing...'}
                </p>
                {result.analysis.problems && result.analysis.problems.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                      KEY PROBLEMS WE SOLVE
                    </p>
                    <ul className="space-y-2">
                      {result.analysis.problems.slice(0, 3).map((problem: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-black">→</span> {problem}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>

              {result.analysis.hiddenOpportunities && result.analysis.hiddenOpportunities.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="minimal-card bg-gradient-to-br from-yellow-50 to-orange-50 animate-pulse-shadow"
                >
                  <p className="text-sm font-bold uppercase tracking-wider mb-4">
                    💡 HIDDEN OPPORTUNITIES DISCOVERED
                  </p>
                  <ul className="space-y-3">
                    {result.analysis.hiddenOpportunities.map((opp: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-2xl leading-none">→</span>
                        <span className="text-base">{opp}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          )}

          {/* Recommended Solutions */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold uppercase tracking-wider text-center text-black mb-12">
              RECOMMENDED SOLUTIONS
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {botRecommendations.map((bot, i) => (
                <motion.button
                  key={bot.id}
                  onClick={() => handleSelectBot(bot.id, bot.type, bot.subtype)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`minimal-card-interactive text-left relative transition-all ${
                    selectedBot === bot.id ? 'ring-4 ring-black ring-offset-4' : ''
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInfoTab('overview');
                      setShowInfoFor(showInfoFor === bot.id ? null : bot.id);
                    }}
                    aria-label="More info"
                    className="absolute top-6 right-6 p-2 hover:bg-gray-100 transition-colors rounded-lg"
                  >
                    <Info className="w-5 h-5 text-gray-500" />
                  </button>

                  {/* Info Modal */}
                  {showInfoFor === bot.id && (
                    <div
                      onClick={(e) => { e.stopPropagation(); setShowInfoFor(null); }}
                      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
                          <div>
                            <h3 className="text-xl font-bold uppercase tracking-wider text-black">{bot.title}</h3>
                            <p className="text-sm text-gray-600 uppercase tracking-wider mt-1">
                              DEEP DIVE: IMPLEMENTATION & INTEGRATION
                            </p>
                          </div>
                          <button
                            onClick={() => setShowInfoFor(null)}
                            className="p-2 hover:bg-gray-100 transition-colors rounded-lg"
                          >
                            <X className="w-6 h-6 text-gray-500" />
                          </button>
                        </div>

                        {/* Tabs */}
                        <div className="px-8 pt-6">
                          <div className="flex gap-2 text-sm mb-6">
                            {(['overview','setup','integrations','api','security'] as const).map(t => (
                              <button
                                key={t}
                                onClick={() => setInfoTab(t)}
                                className={`px-4 py-2 rounded-lg uppercase tracking-wider font-bold transition-all ${
                                  infoTab === t 
                                    ? 'bg-black text-white' 
                                    : 'text-gray-500 hover:text-black'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>

                          {/* Tab content */}
                          <div className="pb-8 text-gray-700">
                            {infoTab === 'overview' && (
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">WHAT IT DOES</p>
                                  <p>{bot.type === 'support' ? 'Resolves FAQs, triages issues and escalates to the right team.' : bot.type === 'lead' ? 'Qualifies leads with structured questions and offers booking.' : bot.type === 'workflow' ? 'Automates a concrete workflow end-to-end.' : 'Answers accurately using your website and documents.'}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">WHEN TO USE</p>
                                  <p>{bot.type === 'support' ? 'High ticket volume and repeated questions.' : bot.type === 'lead' ? 'Inbound traffic where SDR time is limited.' : bot.type === 'workflow' ? 'You have a standardizable process users repeat.' : 'You have rich documentation or product info.'}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">KEY METRICS</p>
                                  <ul className="space-y-1">
                                    {bot.metrics.map((m:string, i:number) => (
                                      <li key={i}>→ {m}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}

                            {infoTab === 'setup' && (
                              <div className="space-y-4">
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">STEPS (5–15 MIN)</p>
                                <ol className="list-decimal pl-5 space-y-2">
                                  <li>Upload key documents (FAQs, manuals, price lists as needed)</li>
                                  <li>Customize tone, welcome message and quick replies</li>
                                  <li>Configure type-specific settings (lead fields, categories, etc.)</li>
                                  <li>Optional: connect integrations (Calendly, Zendesk, HubSpot)</li>
                                  <li>Build the bot and embed the one-line snippet on your site</li>
                                </ol>
                              </div>
                            )}

                            {infoTab === 'integrations' && (
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">AVAILABLE INTEGRATIONS</p>
                                  <p>Calendly (booking), Zendesk (tickets), HubSpot (contacts/deals), Slack (alerts){bot.subtype === 'ecommerce' ? ', Shopify (products/orders)' : ''}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">TYPICAL FLOWS</p>
                                  <ul className="space-y-1">
                                    <li>→ Support: create Zendesk ticket with summary</li>
                                    <li>→ Lead: upsert HubSpot contact on qualification</li>
                                    <li>→ Booking: show Calendly link or internal booking</li>
                                    {bot.subtype === 'ecommerce' && <li>→ E-commerce: query Shopify products</li>}
                                  </ul>
                                </div>
                              </div>
                            )}

                            {infoTab === 'api' && (
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">EMBED CODE</p>
                                  <pre className="bg-black p-4 text-xs overflow-x-auto border border-gray-800">
{`<script src="https://optero.ai/widget.js" 
  data-bot-id="YOUR_BOT_ID"></script>`}
                                  </pre>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">CHAT API</p>
                                  <p className="font-mono text-sm">POST /api/bots/chat</p>
                                  <p className="text-sm mt-1">Body: {`{ botId, history: [{role, content}] }`}</p>
                                </div>
                              </div>
                            )}

                            {infoTab === 'security' && (
                              <div className="space-y-4">
                                <ul className="space-y-2">
                                  <li>→ PII masking in all logs</li>
                                  <li>→ Encrypted secret storage</li>
                                  <li>→ Domain-restricted embedding</li>
                                  <li>→ Optional JWT authentication</li>
                                  <li>→ Data deletion on request</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold uppercase tracking-wider text-black mb-3">{bot.title}</h3>
                  <p className="text-gray-600 mb-6">
                    {bot.description}
                  </p>
                  
                  <div className="space-y-2 mb-8">
                    {bot.metrics.map((metric, j) => (
                      <p key={j} className="text-sm text-gray-500 flex items-start gap-2">
                        <span>→</span> {metric}
                      </p>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider pt-6 border-t border-gray-200">
                    <span className="text-gray-500">TIME: {bot.effort}</span>
                    <span className="font-bold text-green-600">SAVE {bot.savings}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Advanced Solutions */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold uppercase tracking-wider text-center text-black mb-4">
              ADVANCED SOLUTIONS
            </h2>
            <p className="text-center text-gray-600 uppercase tracking-wider text-sm mb-12">
              REQUIRES CONSULTATION AND CUSTOM SETUP
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {advancedSolutions.map((solution, i) => (
                <motion.button
                  key={i}
                  onClick={() => setShowAdvancedInfo(showAdvancedInfo === solution.title ? null : solution.title)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="minimal-card animate-pulse-shadow bg-gradient-to-br from-gray-50 to-blue-50 text-left relative cursor-pointer"
                >
                  <div className="absolute top-6 right-6">
                    <Info className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold uppercase tracking-wider text-black mb-3">{solution.title}</h3>
                  <p className="text-gray-400 mb-6">
                    {solution.description}
                  </p>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">
                    {solution.complexity}
                  </p>
                  
                  {showAdvancedInfo === solution.title && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 top-full mt-4 p-8 bg-white rounded-2xl shadow-2xl z-50 text-left"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowAdvancedInfo(null); }}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 transition-colors rounded-lg"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                      
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">WHAT IS THIS?</h4>
                      <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                        {solution.details.what}
                      </p>
                      
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">BENEFITS</h4>
                      <ul className="space-y-2 mb-6">
                        {solution.details.benefits.map((benefit, j) => (
                          <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-black">→</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">EXAMPLES</h4>
                      <p className="text-sm text-gray-500 italic">
                        {solution.details.examples}
                      </p>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6">
            <motion.button
              onClick={handleConsultation}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="minimal-button-outline"
            >
              BOOK CONSULTATION
            </motion.button>
            
            {selectedBot && (
              <motion.button
                onClick={handleContinue}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="minimal-button inline-flex items-center gap-3"
              >
                BUILD BOT NOW
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}