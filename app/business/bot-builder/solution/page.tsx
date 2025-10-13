"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
        <div className="text-center max-w-md">
          <div className="w-24 h-24 border border-black mx-auto mb-8 relative">
            <div 
              className="absolute inset-0 bg-black transition-all duration-500"
              style={{ 
                height: `${progress}%`,
                bottom: 0,
                top: 'auto'
              }}
            />
          </div>
          <h2 className="text-2xl font-thin uppercase tracking-wider mb-4">
            BYGGER DIN BOT
          </h2>
          <p className="text-sm text-gray-600">
            {buildPhase}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Icon */}
        <div className="flex justify-center mb-12">
          <div className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center">
            <Check className="w-10 h-10" />
          </div>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-thin uppercase tracking-wider mb-4">
            DIN BOT ÄR KLAR
          </h1>
          <p className="text-lg text-gray-600">
            Redo att börja hjälpa dina kunder
          </p>
        </div>

        {/* Bot Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-thin mb-2">98%</div>
            <div className="text-xs uppercase tracking-widest text-gray-600">Träffsäkerhet</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-thin mb-2">24/7</div>
            <div className="text-xs uppercase tracking-widest text-gray-600">Tillgänglig</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-thin mb-2">&lt; 5s</div>
            <div className="text-xs uppercase tracking-widest text-gray-600">Svarstid</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-thin mb-2">∞</div>
            <div className="text-xs uppercase tracking-widest text-gray-600">Samtal</div>
          </div>
        </div>

        {/* Installation Code */}
        <div className="bg-gray-50 p-8 mb-12">
          <h3 className="text-xs uppercase tracking-widest mb-4">Installation</h3>
          <p className="text-sm text-gray-600 mb-6">
            Klistra in denna kod före &lt;/body&gt; på din webbplats:
          </p>
          <div className="bg-white border border-gray-300 p-4 font-mono text-xs relative">
            <pre className="overflow-x-auto">
{`<script src="https://optero-production.up.railway.app/widget.js" 
        data-bot-id="${botId || 'YOUR_BOT_ID'}"></script>`}
            </pre>
            <button
              onClick={copyEmbedCode}
              className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleTestBot}
            className="px-12 py-4 border border-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all"
          >
            Testa bot
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-12 py-4 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-900 transition-all"
          >
            Gå till dashboard
          </button>
        </div>

        {/* Next Steps */}
        <div className="mt-24 border-t border-gray-200 pt-12">
          <h3 className="text-xs uppercase tracking-widest text-center mb-8">Nästa steg</h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-thin mb-3">1</div>
              <p className="text-sm text-gray-600">
                Testa boten och finjustera svar
              </p>
            </div>
            <div>
              <div className="text-3xl font-thin mb-3">2</div>
              <p className="text-sm text-gray-600">
                Installera på din webbplats
              </p>
            </div>
            <div>
              <div className="text-3xl font-thin mb-3">3</div>
              <p className="text-sm text-gray-600">
                Följ statistik i dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}