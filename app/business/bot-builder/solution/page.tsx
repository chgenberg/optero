"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MinimalIcons } from "@/components/MinimalIcons";

export default function BotBuilderSolution() {
  const router = useRouter();
  const [building, setBuilding] = useState(true);
  const [progress, setProgress] = useState(0);
  const [botId, setBotId] = useState<string | null>(null);
  const [buildPhase, setBuildPhase] = useState("Förbereder...");

  useEffect(() => {
    const interview = sessionStorage.getItem("botInterviewData");
    const problem = sessionStorage.getItem("botProblemData");
    const url = sessionStorage.getItem("botWebsiteUrl");
    const brandConfig = sessionStorage.getItem("botBrandConfig");
    
    if (!interview || !problem || !url || !brandConfig) {
      router.push("/business/bot-builder");
      return;
    }

    // Build bot server-side
    (async () => {
      try {
        setBuildPhase("Analyserar webbplats...");
        
        const problemData = JSON.parse(problem);
        const interviewData = JSON.parse(interview);
        const brand = JSON.parse(brandConfig);
        
        const consult = {
          url,
          websiteContent: '',
          websiteSummary: {},
          documentsContent: '',
          problems: [problemData.problem],
          brandConfig: brand
        } as any;

        setBuildPhase("Konfigurerar AI-modell...");
        
        const resp = await fetch('/api/bots/build', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            consult, 
            conversations: interviewData.messages || [],
            brandConfig: brand
          })
        });
        setBuildPhase("Optimerar för ditt use case...");
        
        const data = await resp.json();
        if (data?.botId) {
          setBotId(data.botId);
          sessionStorage.setItem('botBuilder_botId', data.botId);
          setBuildPhase("Slutför...");
        }
      } catch (e) {
        console.error('Failed to build bot', e);
      } finally {
        // Simulate progress while building completes
        const interval = setInterval(() => {
          setProgress((p) => {
            if (p >= 100) {
              clearInterval(interval);
              setBuilding(false);
              return 100;
            }
            return p + 10;
          });
        }, 300);
      }
    })();
  }, [router]);

  const handleTestBot = () => {
    const id = botId || sessionStorage.getItem('botBuilder_botId');
    if (id) router.push(`/bots/chat?botId=${id}`);
  };

  const handleDeploy = () => {
    router.push("/business/bot-builder/deploy");
  };

  if (building) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="minimal-box max-w-md w-full text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-8">
            Bygger din bot
          </h2>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div 
              className="bg-black h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-600">
            {buildPhase}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Detta tar vanligtvis 10-30 sekunder
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="minimal-box text-center">
          {/* Success indicator */}
          <div className="w-16 h-16 bg-black rounded-full mx-auto mb-8 flex items-center justify-center">
            <MinimalIcons.Check className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Din bot är klar!
          </h2>
          
          <p className="text-lg text-gray-600 mb-12 max-w-lg mx-auto">
            Vi har skapat en bot som är optimerad för ditt specifika use case och redo att börja hjälpa dina kunder
          </p>

          {/* Bot preview */}
          <div className="bg-gray-50 rounded-xl p-8 mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-black rounded-full"></div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Din nya bot</h3>
                <p className="text-sm text-gray-500">Leadkvalificering & support</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-2xl font-light text-gray-900 mb-1">98%</div>
                <div className="text-gray-600">Träffsäkerhet</div>
              </div>
              <div>
                <div className="text-2xl font-light text-gray-900 mb-1">24/7</div>
                <div className="text-gray-600">Tillgänglighet</div>
              </div>
              <div>
                <div className="text-2xl font-light text-gray-900 mb-1">5 sek</div>
                <div className="text-gray-600">Svarstid</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleTestBot}
              className="btn-minimal-outline"
            >
              Testa boten
            </button>
            <button
              onClick={handleDeploy}
              className="btn-minimal"
            >
              Installera på din sida
            </button>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-16 grid grid-cols-2 gap-8 text-sm">
          <div className="text-center">
            <h4 className="font-medium text-gray-900 mb-2">Nästa steg</h4>
            <p className="text-gray-600">
              Testa boten för att se hur den svarar på vanliga frågor, 
              sedan kan du finjustera och installera den på din webbplats
            </p>
          </div>
          <div className="text-center">
            <h4 className="font-medium text-gray-900 mb-2">Support</h4>
            <p className="text-gray-600">
              Vi finns här för att hjälpa dig komma igång. 
              Kontakta oss om du har några frågor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
