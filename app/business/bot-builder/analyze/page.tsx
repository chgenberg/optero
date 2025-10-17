"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Info, Check, X, Zap } from "lucide-react";

export default function AnalyzeProblem() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [selectedBot, setSelectedBot] = useState("");
  const [showInfoFor, setShowInfoFor] = useState<string | null>(null);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState<string | null>(null);
  const [infoTab, setInfoTab] = useState<'overview'|'setup'|'integrations'|'api'|'security'>('overview');
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const analyzeWebsite = async () => {
      const url = sessionStorage.getItem("botWebsiteUrl");
      if (!url) {
        router.push("/business/bot-builder/identify");
        return;
      }

      // Start progress animation
      let currentProgress = 0;
      progressInterval.current = setInterval(() => {
        currentProgress += 100 / 90; // 90 seconds to complete
        if (currentProgress >= 100) {
          currentProgress = 100;
          if (progressInterval.current) clearInterval(progressInterval.current);
        }
        setProgress(currentProgress);
      }, 1000);

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
              setProgress(100);
              if (progressInterval.current) clearInterval(progressInterval.current);
              setTimeout(() => setAnalyzing(false), 500);
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
        
        setProgress(100);
        if (progressInterval.current) clearInterval(progressInterval.current);
      } catch (error) {
        console.error("Analysis error:", error);
        if (progressInterval.current) clearInterval(progressInterval.current);
      } finally {
        setTimeout(() => setAnalyzing(false), 1500);
      }
    };

    analyzeWebsite();
    
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
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
    // Navigate to overview page instead of directly to customize
    router.push("/business/bot-builder/overview");
  };

  const handleConsultation = () => {
    router.push("/contact");
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-16">
          {/* Progress */}
          <div className="flex justify-center">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-black font-bold text-lg md:text-xl flex items-center justify-center rounded-2xl shadow-lg">
                <Check className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
              </div>
              <div className="w-12 md:w-24 h-[2px] bg-gray-300" />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 md:w-16 md:h-16 bg-black text-white rounded-2xl flex items-center justify-center animate-pulse-box shadow-xl"
              >
                <Zap className="w-6 h-6 md:w-8 md:h-8" />
              </motion.div>
              <div className="w-12 md:w-24 h-[2px] bg-gray-300" />
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-gray-400 font-bold text-lg md:text-xl flex items-center justify-center rounded-2xl border-2 border-gray-200">
                02
              </div>
              <div className="w-12 md:w-24 h-[2px] bg-gray-300" />
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-gray-400 font-bold text-lg md:text-xl flex items-center justify-center rounded-2xl border-2 border-gray-200">
                03
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="space-y-12 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold uppercase tracking-wider text-black"
            >
              ANALYZING YOUR BUSINESS
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-8"
            >
              <p className="text-gray-600 uppercase tracking-wider text-sm">
                PROCESSING WEBSITE AND DOCUMENTS...
              </p>
              
              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-4">
                <div className="relative">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-black relative overflow-hidden"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ["-100%", "100%"]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </motion.div>
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(0, 0, 0, 0)",
                        "0 0 0 8px rgba(0, 0, 0, 0.1)",
                        "0 0 0 0 rgba(0, 0, 0, 0)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                <motion.p 
                  className="text-2xl font-bold text-black"
                  animate={{
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {Math.round(progress)}%
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center mb-8 md:mb-16">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white text-black font-bold text-sm sm:text-lg md:text-xl flex items-center justify-center rounded-2xl shadow-lg">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-500" />
            </div>
            <div className="w-8 sm:w-12 md:w-24 h-[2px] bg-gray-300" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-black text-white font-bold text-sm sm:text-lg md:text-xl flex items-center justify-center rounded-2xl animate-pulse-box shadow-xl"
            >
              AI
            </motion.div>
            <div className="w-8 sm:w-12 md:w-24 h-[2px] bg-gray-300" />
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white text-gray-400 font-bold text-sm sm:text-lg md:text-xl flex items-center justify-center rounded-2xl border-2 border-gray-200">
              02
            </div>
            <div className="w-8 sm:w-12 md:w-24 h-[2px] bg-gray-300" />
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white text-gray-400 font-bold text-sm sm:text-lg md:text-xl flex items-center justify-center rounded-2xl border-2 border-gray-200">
              03
            </div>
          </div>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wider text-black mb-4">
            AI ANALYSIS COMPLETE
          </h1>
          <p className="text-gray-600 uppercase tracking-wider text-xs md:text-sm mb-8">
            CHOOSE YOUR AI IMPLEMENTATION
          </p>
          
          {result?.analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <div className="space-y-4 text-left">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">YOUR BUSINESS</p>
                  <p className="text-gray-700">{result.analysis.description}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4 pt-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">TARGET AUDIENCE</p>
                    <p className="text-sm">{result.analysis.audience?.type} • {result.analysis.audience?.industry}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">MAIN CHALLENGE</p>
                    <p className="text-sm">{result.analysis.problems?.[0]}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">OPPORTUNITY</p>
                    <p className="text-sm">{result.analysis.hiddenOpportunities?.[0] || 'Process automation'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Bot Recommendations */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-center text-black mb-8 md:mb-12">
            RECOMMENDED SOLUTIONS
          </h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {botRecommendations.map((bot, i) => (
              <motion.button
                key={bot.id}
                onClick={() => handleSelectBot(bot.id, bot.type, bot.subtype)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`minimal-card-interactive text-left relative transition-all transform ${
                  selectedBot === bot.id 
                    ? 'ring-4 ring-black bg-gray-50 shadow-2xl scale-[1.02] border-black' 
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  {selectedBot === bot.id && (
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInfoFor(showInfoFor === bot.id ? null : bot.id);
                    }}
                    aria-label="More info"
                    className="p-2 hover:bg-gray-100 transition-colors rounded-lg"
                  >
                    <Info className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <h3 className="text-xl font-bold uppercase tracking-wider text-black mb-2">
                  {bot.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {bot.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  {bot.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">TIME</p>
                    <p className="font-bold">{bot.effort}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-gray-500">SAVE</p>
                    <p className="font-bold text-green-600">{bot.savings}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Selected Bot Action */}
          {selectedBot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mt-12"
            >
              <button
                onClick={handleContinue}
                className="minimal-button group"
              >
                CONTINUE TO BUILD
                <ArrowRight className="inline-block ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Advanced Solutions */}
        <div className="border-t border-gray-200 pt-16">
          <h2 className="text-3xl font-bold uppercase tracking-wider text-center text-black mb-4">
            ADVANCED SOLUTIONS
          </h2>
          <p className="text-center text-gray-600 mb-12 uppercase tracking-wider text-sm">
            CUSTOM IMPLEMENTATION WITH CONSULTATION
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
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
                
                <h3 className="text-xl font-bold uppercase tracking-wider text-black mb-2">
                  {solution.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {solution.description}
                </p>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  {solution.complexity}
                </p>
              </motion.button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleConsultation}
              className="minimal-button-outline"
            >
              BOOK CONSULTATION
            </button>
          </div>
        </div>

        {/* Bot Info Popup */}
        {showInfoFor && (
          <div
            onClick={(e) => { e.stopPropagation(); setShowInfoFor(null); }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wider text-black">
                    {botRecommendations.find(b => b.id === showInfoFor)?.title}
                  </h3>
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
              <div className="px-4 sm:px-8 pt-4 sm:pt-6">
                <div className="flex gap-2 text-xs sm:text-sm mb-4 sm:mb-6 overflow-x-auto">
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
                <div className="pb-4 sm:pb-8 text-gray-700">
                  {infoTab === 'overview' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">WHAT IT DOES</p>
                        <p>{botRecommendations.find(b => b.id === showInfoFor)?.type === 'support' ? 'Resolves FAQs, triages issues and escalates to the right team.' : botRecommendations.find(b => b.id === showInfoFor)?.type === 'lead' ? 'Qualifies leads with structured questions and offers booking.' : botRecommendations.find(b => b.id === showInfoFor)?.type === 'workflow' ? 'Automates a concrete workflow end-to-end.' : 'Answers accurately using your website and documents.'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">WHEN TO USE</p>
                        <p>{botRecommendations.find(b => b.id === showInfoFor)?.type === 'support' ? 'High ticket volume and repeated questions.' : botRecommendations.find(b => b.id === showInfoFor)?.type === 'lead' ? 'Inbound traffic where SDR time is limited.' : botRecommendations.find(b => b.id === showInfoFor)?.type === 'workflow' ? 'You have a standardizable process users repeat.' : 'You have rich documentation or product info.'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">KEY METRICS</p>
                        <ul className="space-y-1">
                          {botRecommendations.find(b => b.id === showInfoFor)?.metrics.map((m:string, i:number) => (
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
                        <p>Calendly (booking), Zendesk (tickets), HubSpot (contacts/deals), Slack (alerts){botRecommendations.find(b => b.id === showInfoFor)?.subtype === 'ecommerce' ? ', Shopify (products/orders)' : ''}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">TYPICAL FLOWS</p>
                        <ul className="space-y-1">
                          <li>→ Support: create Zendesk ticket with summary</li>
                          <li>→ Lead: upsert HubSpot contact on qualification</li>
                          <li>→ Booking: show Calendly link for appointments</li>
                          <li>→ E-commerce: fetch products from Shopify</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {infoTab === 'api' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">WIDGET API</p>
                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// Send custom data
MendioWidget.setUserData({
  id: 'user123',
  email: 'user@example.com',
  customField: 'value'
});

// Listen to events
MendioWidget.on('leadCaptured', (data) => {
  gtag('event', 'lead_capture', data);
});`}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">BACKEND API</p>
                        <p className="text-sm">REST endpoints to fetch conversation history, analytics, manage knowledge base. API key authentication.</p>
                      </div>
                    </div>
                  )}

                  {infoTab === 'security' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">DATA PRIVACY</p>
                        <ul className="space-y-1">
                          <li>✓ GDPR compliant with DPA available</li>
                          <li>✓ All data encrypted at rest and in transit</li>
                          <li>✓ EU servers (Stockholm region)</li>
                          <li>✓ No training on your data</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">ACCESS CONTROL</p>
                        <ul className="space-y-1">
                          <li>✓ SSO/SAML support (Enterprise)</li>
                          <li>✓ Role-based permissions</li>
                          <li>✓ Audit logs for all actions</li>
                          <li>✓ IP whitelisting available</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Advanced Solution Popup */}
        {showAdvancedInfo && (
          <div
            onClick={(e) => { e.stopPropagation(); setShowAdvancedInfo(null); }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold uppercase tracking-wider text-black">
                    {advancedSolutions.find(s => s.title === showAdvancedInfo)?.title}
                  </h4>
                  <button
                    onClick={() => setShowAdvancedInfo(null)}
                    className="p-2 hover:bg-gray-100 transition-colors rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="px-8 py-6">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">WHAT IT IS</p>
                  <p className="text-gray-700">
                    {advancedSolutions.find(s => s.title === showAdvancedInfo)?.details.what}
                  </p>
                </div>
                
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">KEY BENEFITS</p>
                  <ul className="space-y-2">
                    {advancedSolutions.find(s => s.title === showAdvancedInfo)?.details.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <p className="text-sm text-gray-500 italic mt-6">
                  {advancedSolutions.find(s => s.title === showAdvancedInfo)?.details.examples}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}