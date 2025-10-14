"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";

export default function BotBuilderSolution() {
  const router = useRouter();
  const [building, setBuilding] = useState(true);
  const [progress, setProgress] = useState(0);
  const [botId, setBotId] = useState<string | null>(null);
  const [buildPhase, setBuildPhase] = useState("Förbereder...");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const problem = sessionStorage.getItem("botProblemData");
    const url = sessionStorage.getItem("botWebsiteUrl");
    const brandConfig = sessionStorage.getItem("botBrandConfig");
    const additionalInfo = sessionStorage.getItem("botAdditionalInfo");
    
    if (!problem || !url || !brandConfig) {
      router.push("/business/bot-builder");
      return;
    }

    (async () => {
      try {
        setBuildPhase("Analyserar data...");
        
        const problemData = JSON.parse(problem);
        const brand = JSON.parse(brandConfig);
        const deepAnalysis = JSON.parse(sessionStorage.getItem("botDeepAnalysis") || '{}');
        const integrations = JSON.parse(sessionStorage.getItem("botIntegrations") || '{}');
        const documentContent = sessionStorage.getItem("botDocuments") || "";
        const documentFiles = JSON.parse(sessionStorage.getItem("botDocumentFiles") || '[]');
        
        const userEmail = sessionStorage.getItem("botUserEmail") || "";
        
        const consult = {
          url,
          websiteContent: '',
          websiteSummary: {},
          documentsContent: documentContent + (additionalInfo ? `\n\nSpecial instructions: ${additionalInfo}` : ''),
          documentFiles,
          problems: [problemData.problem],
          botType: problemData.botType || 'knowledge',
          userEmail,
          brandConfig: brand,
          integrations,
          pages: deepAnalysis.pages || []
        } as any;

        setBuildPhase("Tränar AI-modell...");
        setProgress(30);
        
        const resp = await fetch('/api/bots/build', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            consult, 
            conversations: [],
            brandConfig: brand
          })
        });
        
        setBuildPhase("Optimerar prestanda...");
        setProgress(60);
        
        const data = await resp.json();
        if (data?.botId) {
          setBotId(data.botId);
          sessionStorage.setItem('botBuilder_botId', data.botId);
          setBuildPhase("Slutför...");
          setProgress(90);
        }
      } catch (e) {
        console.error('Failed to build bot', e);
      } finally {
        setTimeout(() => {
          setProgress(100);
          setBuilding(false);
        }, 1000);
      }
    })();
  }, [router]);

  const handleTestBot = () => {
    const id = botId || sessionStorage.getItem('botBuilder_botId');
    if (id) router.push(`/bots/chat?botId=${id}`);
  };

  const copyEmbedCode = () => {
    const id = botId || sessionStorage.getItem('botBuilder_botId');
    const code = `<script src="https://optero-production.up.railway.app/widget.js" data-bot-id="${id}"></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (building) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 border-2 border-black rounded-full mx-auto mb-8 relative overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-black"
              initial={{ y: '100%' }}
              animate={{ y: `-${100 - progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-3">Bygger din bot</h2>
          <p className="text-sm text-[#4B5563]">{buildPhase}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success */}
          <div className="flex justify-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center"
            >
              <Check className="w-10 h-10" />
            </motion.div>
          </div>

          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-3">Din bot är klar</h1>
            <p className="text-lg text-[#4B5563]">Redo att börja hjälpa dina kunder</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { value: "98%", label: "Träffsäkerhet" },
              { value: "24/7", label: "Tillgänglig" },
              { value: "< 5s", label: "Svarstid" },
              { value: "∞", label: "Samtal" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-xs text-[#9CA3AF] uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Installation */}
          <div className="card bg-[#F9FAFB] mb-12">
            <h3 className="mb-4">Installation</h3>
            <p className="text-sm text-[#4B5563] mb-4">
              Klistra in denna kod före <strong>&lt;/body&gt;</strong> på din webbplats:
            </p>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 font-mono text-xs relative">
              <pre className="overflow-x-auto text-[#1F2937]">
{`<script src="https://optero-production.up.railway.app/widget.js" 
        data-bot-id="${botId || 'YOUR_BOT_ID'}"></script>`}
              </pre>
              <button
                onClick={copyEmbedCode}
                className="absolute top-2 right-2 p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[#9CA3AF]" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mb-16">
            <motion.button
              onClick={handleTestBot}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary"
            >
              Testa bot
            </motion.button>
            <motion.button
              onClick={() => router.push('/dashboard')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
            >
              Gå till dashboard
            </motion.button>
          </div>

          {/* Next Steps */}
          <div className="border-t border-[#E5E7EB] pt-12">
            <h3 className="text-center mb-8">Nästa steg</h3>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { num: "1", text: "Testa boten och finjustera svar" },
                { num: "2", text: "Installera på din webbplats" },
                { num: "3", text: "Följ statistik i dashboard" }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="text-3xl font-bold mb-3">{step.num}</div>
                  <p className="text-sm text-[#4B5563]">{step.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
