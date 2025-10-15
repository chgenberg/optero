"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Copy, Bot, Zap, Shield } from "lucide-react";

export default function BotBuilderSolution() {
  const router = useRouter();
  const [building, setBuilding] = useState(true);
  const [progress, setProgress] = useState(0);
  const [botId, setBotId] = useState<string | null>(null);
  const [buildPhase, setBuildPhase] = useState("INITIALIZING...");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const selectedBotType = sessionStorage.getItem("selectedBotType");
    const selectedBotId = sessionStorage.getItem("selectedBotId");
    const url = sessionStorage.getItem("botWebsiteUrl");
    const brandConfig = sessionStorage.getItem("botBrandConfig");
    const additionalInfo = sessionStorage.getItem("botAdditionalContext");
    
    if (!selectedBotType || !url || !brandConfig) {
      router.push("/business/bot-builder");
      return;
    }

    (async () => {
      try {
        setBuildPhase("ANALYZING DATA...");
        setProgress(10);
        
        const brand = JSON.parse(brandConfig);
        const deepAnalysis = JSON.parse(sessionStorage.getItem("botDeepAnalysis") || '{}');
        const typeSettings = JSON.parse(sessionStorage.getItem("botTypeSettings") || '{}');
        const integrations = JSON.parse(sessionStorage.getItem("botIntegrations") || '{}');
        const documentContent = sessionStorage.getItem("botDocuments") || "";
        const documentFiles = JSON.parse(sessionStorage.getItem("botDocumentFiles") || '[]');
        const userEmail = sessionStorage.getItem("botUserEmail") || "";
        const botSubtype = sessionStorage.getItem("selectedBotSubtype") || "";
        
        const consult = {
          url,
          websiteContent: '',
          websiteSummary: {},
          documentsContent: documentContent + (additionalInfo ? `\n\nSpecial instructions: ${additionalInfo}` : ''),
          documentFiles,
          problems: [`Build a ${selectedBotType} bot`],
          botType: selectedBotType,
          botSubtype: botSubtype || null,
          userEmail,
          brandConfig: brand,
          integrations,
          typeSettings,
          pages: deepAnalysis.pages || []
        } as any;
        
        // Simulate progress updates
        const progressTimer = setInterval(() => {
          setProgress(p => {
            if (p >= 85) {
              clearInterval(progressTimer);
              return 85;
            }
            return p + Math.random() * 15;
          });
        }, 800);
        
        // Update build phases
        setTimeout(() => setBuildPhase("EXTRACTING KNOWLEDGE..."), 1500);
        setTimeout(() => setBuildPhase("TRAINING AI MODEL..."), 3000);
        setTimeout(() => setBuildPhase("CONFIGURING INTEGRATIONS..."), 4500);
        setTimeout(() => setBuildPhase("FINALIZING BOT..."), 6000);
        
        const response = await fetch("/api/bots/build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consult })
        });
        
        clearInterval(progressTimer);
        
        if (!response.ok) {
          throw new Error("Build failed");
        }
        
        const data = await response.json();
        
        if (data.botId) {
          setBotId(data.botId);
          sessionStorage.setItem("lastBuiltBotId", data.botId);
          setProgress(100);
          setBuildPhase("COMPLETE!");
          
          setTimeout(() => {
            setBuilding(false);
          }, 1000);
        }
      } catch (error) {
        console.error("Build error:", error);
        setBuildPhase("ERROR - PLEASE TRY AGAIN");
        setBuilding(false);
      }
    })();
  }, [router]);

  const copyEmbedCode = () => {
    if (!botId) return;
    const embedCode = `<script src="https://optero-production.up.railway.app/widget.js" data-bot-id="${botId}"></script>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: "RESPONSE TIME", value: "< 2s" },
    { label: "ACCURACY", value: "95%" },
    { label: "LANGUAGES", value: "100+" },
    { label: "UPTIME", value: "99.9%" }
  ];

  const nextSteps = [
    { icon: Bot, title: "TEST YOUR BOT", desc: "Try it before going live" },
    { icon: Zap, title: "CONNECT INTEGRATIONS", desc: "Link CRM, calendar, etc." },
    { icon: Shield, title: "MONITOR PERFORMANCE", desc: "Track usage and ROI" }
  ];

  if (building) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-2xl w-full"
        >
          {/* Animated Build Icon */}
          <div className="relative w-32 h-32 mx-auto mb-12">
            <motion.div
              className="absolute inset-0 bg-black rounded-2xl shadow-2xl"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-4 bg-gray-50 rounded-xl"
              animate={{ 
                scale: [1, 0.8, 1],
                rotate: [0, -180, -360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          
          <h2 className="text-4xl font-bold uppercase tracking-wider text-black mb-4">
            BUILDING YOUR BOT
          </h2>
          
          <p className="text-gray-600 uppercase tracking-wider text-sm mb-12">
            {buildPhase}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 rounded-full relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-black rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <p className="text-2xl font-bold text-black mt-6">
            {Math.round(progress)}%
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Progress */}
        <div className="flex justify-center mb-20">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-green-500 text-white font-bold text-xl flex items-center justify-center rounded-2xl shadow-xl">
              <Check className="w-6 h-6" />
            </div>
            <div className="w-24 h-[2px] bg-gray-300" />
            <div className="w-16 h-16 bg-green-500 text-white font-bold text-xl flex items-center justify-center rounded-2xl shadow-xl">
              <Check className="w-6 h-6" />
            </div>
            <div className="w-24 h-[2px] bg-gray-300" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-green-500 text-white font-bold text-xl flex items-center justify-center rounded-2xl shadow-xl animate-pulse-shadow"
            >
              <Check className="w-6 h-6" />
            </motion.div>
          </div>
        </div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-500 mx-auto mb-8 flex items-center justify-center rounded-3xl shadow-2xl"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-5xl font-bold uppercase tracking-wider text-black mb-4">
            YOUR BOT IS READY!
          </h1>
          <p className="text-gray-600 uppercase tracking-wider text-sm">
            START SAVING TIME AND MONEY IMMEDIATELY
          </p>
        </motion.div>

        {/* Embed Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="minimal-card animate-pulse-shadow max-w-3xl mx-auto mb-16"
        >
          <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">
            ONE-CLICK INSTALLATION
          </h3>
          
          <div className="relative">
            <pre className="bg-gray-900 rounded-xl p-6 text-sm overflow-x-auto">
              <code className="text-green-400">
{`<script src="https://optero-production.up.railway.app/widget.js" 
  data-bot-id="${botId}"></script>`}
              </code>
            </pre>
            
            <button
              onClick={copyEmbedCode}
              className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mt-4 uppercase tracking-wider">
            ADD THIS CODE BEFORE {`</BODY>`} TAG ON YOUR WEBSITE
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-black mb-2">{stat.value}</p>
              <p className="text-xs uppercase tracking-wider text-gray-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold uppercase tracking-wider text-center text-black mb-12">
            NEXT STEPS
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {nextSteps.map((step, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  if (i === 0) router.push(`/bots/chat?botId=${botId}`);
                  else if (i === 1) router.push('/dashboard');
                  else router.push('/dashboard');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="minimal-card animate-pulse-shadow hover:scale-105 text-left cursor-pointer"
              >
                <step.icon className="w-8 h-8 text-gray-600 mb-4" />
                <h3 className="font-bold uppercase tracking-wider text-black mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          <motion.button
            onClick={() => router.push(`/bots/chat?botId=${botId}`)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="minimal-button"
          >
            TEST YOUR BOT
          </motion.button>
          
          <motion.button
            onClick={() => router.push('/dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="minimal-button-outline"
          >
            GO TO DASHBOARD
          </motion.button>
        </div>
      </div>
    </div>
  );
}