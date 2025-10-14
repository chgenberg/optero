"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";

export default function AnalyzeProblem() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [selectedBot, setSelectedBot] = useState("");
  const [showInfoFor, setShowInfoFor] = useState<string | null>(null);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState<string | null>(null);

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
        setTimeout(() => setAnalyzing(false), 1200);
      }
    };

    analyzeWebsite();
  }, [router]);

  const botRecommendations = [
    {
      id: "customer-support",
      title: "Kundsupport",
      type: "support",
      description: "Automatisera 60% av supportärenden",
      metrics: ["24/7 tillgänglighet", "< 5 sek svarstid", "90% nöjdhet"],
      effort: "5 min",
      savings: "120 000 kr/år"
    },
    {
      id: "lead-qualification",
      title: "Leadkvalificering",
      type: "lead",
      description: "Kvalificera och boka möten automatiskt",
      metrics: ["3x fler kvalificerade leads", "Automatisk CRM-synk", "Personaliserat"],
      effort: "10 min",
      savings: "250 000 kr/år"
    },
    {
      id: "booking",
      title: "Bokning",
      type: "workflow",
      description: "Eliminera dubbelbokning och manuell hantering",
      metrics: ["Integrerat med kalender", "SMS-påminnelser", "Automatisk bekräftelse"],
      effort: "15 min",
      savings: "80 000 kr/år"
    },
    // Nya auto-skapbara bots
    {
      id: "ecommerce-assistant",
      title: "E‑handel",
      type: "workflow",
      subtype: "ecommerce",
      description: "Produktfinnare, orderstatus och returer",
      metrics: ["+25% konvertering", "Mindre support", "Rekommendationer"],
      effort: "15 min",
      savings: "200 000 kr/år"
    },
    {
      id: "cpq-sales",
      title: "CPQ / Sales‑konfigurator",
      type: "lead",
      subtype: "guided_selling",
      description: "Paket/pris efter behov – genererar offert",
      metrics: ["Kortare säljcykel", "Högre kvalité", "Mindre fel"],
      effort: "20 min",
      savings: "300 000 kr/år"
    },
    {
      id: "onboarding",
      title: "Onboarding / Customer Success",
      type: "knowledge",
      subtype: "onboarding",
      description: "Första‑gången‑guide och 'how‑to'‑svar",
      metrics: ["Färre frågor", "Snabbare värde", "Nöjdare kunder"],
      effort: "10 min",
      savings: "100 000 kr/år"
    },
    {
      id: "knowledge-pro",
      title: "Knowledge Pro",
      type: "knowledge",
      subtype: "pro",
      description: "Dokument‑QA med källor och citat",
      metrics: ["Säkra svar", "Spårbara källor", "Mindre eskalering"],
      effort: "10 min",
      savings: "120 000 kr/år"
    },
    {
      id: "hr-recruiting",
      title: "HR & Rekrytering",
      type: "workflow",
      subtype: "hr_screening",
      description: "Kandidat‑screening och intervjubokning",
      metrics: ["5x snabbare", "Bättre urval", "Automatisk bokning"],
      effort: "15 min",
      savings: "180 000 kr/år"
    },
    {
      id: "it-helpdesk",
      title: "IT‑Helpdesk",
      type: "support",
      subtype: "it_helpdesk",
      description: "Triage + ticket till rätt team",
      metrics: ["Snabbare lösning", "Mindre ticket‑volym", "Bättre data"],
      effort: "10 min",
      savings: "150 000 kr/år"
    },
    {
      id: "resource-booking",
      title: "Bokning med kapacitet",
      type: "workflow",
      subtype: "resource_booking",
      description: "Boka resurser/rum med tider och begränsningar",
      metrics: ["Mindre dubbelbokning", "Automatiska regler", "Smidigt flöde"],
      effort: "20 min",
      savings: "80 000 kr/år"
    },
    {
      id: "returns-rma",
      title: "Retur/RMA",
      type: "workflow",
      subtype: "returns_rma",
      description: "Automatisk retur‑process och garanti‑ärenden",
      metrics: ["Mindre support", "Spårning", "Bättre upplevelse"],
      effort: "15 min",
      savings: "120 000 kr/år"
    },
    {
      id: "billing-payments",
      title: "Faktura/Betalning",
      type: "workflow",
      subtype: "billing_payments",
      description: "Frågor om fakturor, påminnelse och betalningslänkar",
      metrics: ["Mindre administration", "Snabbare betalning", "Mindre fel"],
      effort: "15 min",
      savings: "90 000 kr/år"
    },
    {
      id: "nps-feedback",
      title: "NPS/Feedback",
      type: "workflow",
      subtype: "nps_feedback",
      description: "Insamling och sammanställning av feedback",
      metrics: ["Snabb insikt", "Trendanalys", "Fler svar"],
      effort: "10 min",
      savings: "60 000 kr/år"
    },
    {
      id: "lead-enrichment",
      title: "Lead‑Enrichment",
      type: "lead",
      subtype: "enrichment",
      description: "Fyll på CRM‑fält automatiskt",
      metrics: ["Bättre data", "Högre kvalité", "Mindre manuellt"],
      effort: "10 min",
      savings: "70 000 kr/år"
    },
    {
      id: "churn-prevention",
      title: "Churn‑prevention",
      type: "workflow",
      subtype: "churn_prevention",
      description: "Fånga risk och föreslå winback‑erbjudanden",
      metrics: ["Lägre churn", "Högre LTV", "Tidiga signaler"],
      effort: "20 min",
      savings: "300 000 kr/år"
    },
    {
      id: "sales-internal",
      title: "Intern säljassistent",
      type: "knowledge",
      subtype: "sales_internal",
      description: "Dokument + konkurrent‑FAQ internt",
      metrics: ["Snabbare svar", "Bättre argument", "Mindre söktid"],
      effort: "10 min",
      savings: "120 000 kr/år"
    },
    {
      id: "partner-portal",
      title: "Partner/ÅF‑portal",
      type: "knowledge",
      subtype: "partner_portal",
      description: "Assistent för återförsäljare och partners",
      metrics: ["Färre mail", "Bättre onboarding", "Aktiv utbildning"],
      effort: "15 min",
      savings: "100 000 kr/år"
    },
    {
      id: "gdpr-bot",
      title: "GDPR‑bot",
      type: "workflow",
      subtype: "gdpr",
      description: "Export/erase‑förfrågningar med spårning",
      metrics: ["Compliance", "Säker hantering", "Mindre manuell tid"],
      effort: "15 min",
      savings: "90 000 kr/år"
    },
    {
      id: "multilingual",
      title: "Flerspråk",
      type: "knowledge",
      subtype: "multilingual",
      description: "Auto‑detektera och svara på besökarens språk",
      metrics: ["Bättre upplevelse", "Ökad räckvidd", "Konsistent ton"],
      effort: "10 min",
      savings: "—"
    }
  ];

  const advancedSolutions = [
    {
      title: "Process Automation",
      description: "Automatisera hela arbetsflöden med AI",
      complexity: "Kräver konsultation",
      details: {
        what: "Skräddarsydda AI-agenter som automatiserar komplexa affärsprocesser från början till slut. Kan hantera allt från fakturagodkännanden till komplex databearbetning.",
        benefits: [
          "Minska manuellt arbete med upp till 80%",
          "Eliminera flaskhalsar i processer",
          "Säkerställ konsekvent kvalitet",
          "Frigör tid för strategiskt arbete"
        ],
        examples: "Automatisk fakturakontroll, dynamisk prisoptimering, smart dokumenthantering"
      }
    },
    {
      title: "Knowledge Management",
      description: "AI som förstår alla era dokument och processer",
      complexity: "Kräver konsultation",
      details: {
        what: "Enterprise-grade kunskapshanteringssystem där AI indexerar, förstår och kan svara på frågor från alla era dokument, wiki-sidor, mail och interna system.",
        benefits: [
          "Hitta rätt information på sekunder",
          "Bevara företagskunskap vid personalbyten",
          "Automatisk onboarding av nya medarbetare",
          "Säker delning av intern kompetens"
        ],
        examples: "Intern FAQ-assistent, juridisk dokumentsökning, teknisk dokumentation med AI"
      }
    },
    {
      title: "Predictive Analytics",
      description: "Förutse problem innan de uppstår",
      complexity: "Kräver konsultation",
      details: {
        what: "Prediktiva modeller som analyserar historisk data för att förutspå framtida händelser, identifiera risker och optimera beslut innan problem uppstår.",
        benefits: [
          "Förutse kundbortfall 3-6 månader i förväg",
          "Identifiera kvalitetsproblem innan produktion",
          "Optimera lager baserat på prognoser",
          "Upptäck säkerhetsrisker proaktivt"
        ],
        examples: "Churn prediction, underhållsprognoser, efterfrågesprognoser, riskbedömning"
      }
    }
  ];

  const handleContinue = () => {
    if (!selectedBot) return;
    
    const bot = botRecommendations.find(b => b.id === selectedBot);
    sessionStorage.setItem("botProblemData", JSON.stringify({
      problem: selectedBot,
      botType: bot?.type,
      botSubtype: (bot as any)?.subtype || null,
      details: bot
    }));
    
    router.push("/business/bot-builder/customize");
  };

  const handleConsultation = () => {
    router.push("/business/bot-builder/enterprise");
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 border-2 border-black rounded-full mx-auto mb-8 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ y: '100%' }}
              animate={{ y: '-100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-3">Analyserar din verksamhet</h2>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            Vår AI går igenom all information för att identifiera var automation 
            kan göra din verksamhet mer lönsam och effektiv
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-[2px] bg-[#E5E7EB]" />
            <span className="text-xs font-medium text-[#4B5563] px-3">Steg 2</span>
            <div className="w-8 h-[2px] bg-[#E5E7EB]" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="mb-3">Resultat av analysen</h1>
            
            {result?.analysis && (
              <div className="mt-8 space-y-4 max-w-3xl mx-auto">
                <div className="card">
                  <p className="text-sm font-medium text-[#1F2937] mb-2">AI-insikter från din webbplats</p>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    {result.analysis.description}
                  </p>
                </div>
                
                {result.analysis.hiddenOpportunities?.length > 0 && (
                  <div className="card bg-[#F9FAFB]">
                    <p className="text-sm font-medium text-[#1F2937] mb-3">Dolda möjligheter</p>
                    <ul className="space-y-2">
                      {result.analysis.hiddenOpportunities.map((opp: string, i: number) => (
                        <li key={i} className="text-sm text-[#4B5563] flex items-start gap-2">
                          <span className="text-black font-bold">·</span>
                          <span>{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bot Recommendations */}
          <div className="mb-16">
            <h2 className="text-center mb-8">Rekommenderade lösningar</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {botRecommendations.map((bot, i) => (
                <motion.button
                  key={bot.id}
                  onClick={() => setSelectedBot(bot.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className={`p-6 border-2 rounded-xl text-left transition-all relative ${
                    selectedBot === bot.id
                      ? "border-black bg-[#F9FAFB]"
                      : "border-[#E5E7EB] hover:border-[#4B5563]"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInfoFor(showInfoFor === bot.id ? null : bot.id);
                    }}
                    className="absolute top-4 right-4 p-2 hover:bg-white rounded-full transition-colors"
                  >
                    <Info className="w-4 h-4 text-[#9CA3AF]" />
                  </button>
                  
                  {showInfoFor === bot.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 top-full mt-2 p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-10"
                    >
                      <p className="text-xs text-[#4B5563] leading-relaxed">
                        Denna bot kan automatiskt hantera vanliga frågor, skapa supportärenden 
                        och eskalera komplexa ärenden till rätt person.
                      </p>
                    </motion.div>
                  )}
                  
                  <h3 className="mb-2">{bot.title}</h3>
                  <p className="text-sm text-[#4B5563] mb-4">
                    {bot.description}
                  </p>
                  
                  <div className="space-y-1 mb-6">
                    {bot.metrics.map((metric, j) => (
                      <p key={j} className="text-xs text-[#9CA3AF]">· {metric}</p>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-end pt-4 border-t border-[#E5E7EB]">
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1">Uppsättning</p>
                      <p className="text-sm font-semibold">{bot.effort}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#9CA3AF] mb-1">Besparing</p>
                      <p className="text-sm font-semibold">{bot.savings}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              <motion.button
                onClick={handleContinue}
                disabled={!selectedBot}
                whileHover={selectedBot ? { scale: 1.02 } : {}}
                whileTap={selectedBot ? { scale: 0.98 } : {}}
                className="btn-primary disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                Bygg vald bot
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Advanced Solutions */}
          <div className="border-t border-[#E5E7EB] pt-16">
            <h2 className="text-center mb-8">Avancerade lösningar</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {advancedSolutions.map((solution, i) => (
                <motion.button
                  key={i}
                  onClick={() => setShowAdvancedInfo(showAdvancedInfo === solution.title ? null : solution.title)}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                  className="card hover:border-[#4B5563] transition-all text-left relative"
                >
                  <div className="absolute top-4 right-4">
                    <Info className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                  <h3 className="mb-2">{solution.title}</h3>
                  <p className="text-sm text-[#4B5563] mb-4">
                    {solution.description}
                  </p>
                  <p className="text-xs text-[#9CA3AF] font-medium">
                    {solution.complexity}
                  </p>
                  
                  {showAdvancedInfo === solution.title && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 top-full mt-4 p-6 bg-white border border-[#E5E7EB] rounded-xl shadow-2xl z-50 text-left"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAdvancedInfo(null);
                        }}
                        className="absolute top-4 right-4 text-[#9CA3AF] hover:text-black text-lg"
                      >
                        ×
                      </button>
                      
                      <h4 className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-3">
                        Vad är detta?
                      </h4>
                      <p className="text-sm text-[#4B5563] mb-4 leading-relaxed">
                        {solution.details.what}
                      </p>
                      
                      <h4 className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-3">
                        Fördelar
                      </h4>
                      <ul className="space-y-2 mb-4">
                        {solution.details.benefits.map((benefit, j) => (
                          <li key={j} className="text-sm text-[#4B5563] flex items-start gap-2">
                            <span className="text-black font-bold mt-0.5">·</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <h4 className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider mb-2">
                        Exempel
                      </h4>
                      <p className="text-sm text-[#4B5563] italic">
                        {solution.details.examples}
                      </p>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
            
            <div className="text-center">
              <motion.button
                onClick={handleConsultation}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary"
              >
                Boka konsultation
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-16">
          <button
            onClick={() => router.push("/business/bot-builder/identify")}
            className="text-sm text-[#4B5563] hover:text-black transition-colors"
          >
            Tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}


