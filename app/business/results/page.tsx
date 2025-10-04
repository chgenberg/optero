"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingAnalysis from "@/components/LoadingAnalysis";

function BusinessResultsContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"solutions" | "tools" | "implementation" | "roi">("solutions");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const dept = searchParams?.get("dept") || "";
  const companySize = searchParams?.get("size") || "";
  const industry = searchParams?.get("industry") || "";

  // Calculate totals based on department
  const totalTimeSaved = dept === "sales" ? "20-30 timmar per vecka" : "15-25 timmar per vecka";
  const totalROI = dept === "sales" ? "450,000 - 600,000 SEK" : "300,000 - 450,000 SEK";

  // Mock solutions with more detailed content
  const solutions = [
    {
      title: "Automatiserad leadkvalificering",
      problem: "Säljare spenderar 30% av sin tid på att manuellt granska och kvalificera leads från olika källor",
      solution: "AI-system som automatiskt poängsätter och kvalificerar leads baserat på beteendedata, företagsinformation och historiska mönster. Systemet integreras med ert CRM och prioriterar de mest lovande leads.",
      benefits: [
        "Ökar kvalificerade leads med 40%",
        "Minskar tid per lead från 15 till 2 minuter",
        "Förbättrar konverteringsgraden med 25%",
        "Identifierar köpsignaler i realtid"
      ],
      tools: [
        { name: "Leadfeeder", description: "Identifierar företag som besöker er hemsida", price: "från 1,200 SEK/månad" },
        { name: "Clay.com", description: "AI-driven dataanrikning och leadscoring", price: "från 1,500 SEK/månad" },
        { name: "Clearbit", description: "Automatisk företags- och kontaktdata", price: "från 2,000 SEK/månad" }
      ],
      implementation: {
        week1: "Datakällor integreras och historisk data analyseras",
        week2: "AI-modell tränas på era specifika kundbeteenden",
        week3: "CRM-integration och automatiseringsregler sätts upp",
        week4: "Teamutbildning och processoptimering"
      },
      timeSaved: "8-10 timmar/vecka",
      roi: "150,000 SEK/år"
    },
    {
      title: "AI-driven säljcoaching",
      problem: "Ingen systematisk analys av säljsamtal gör att värdefulla insikter och förbättringsmöjligheter missas",
      solution: "AI som analyserar alla säljsamtal, ger realtidsförslag under samtal och skapar personliga utvecklingsplaner för varje säljare. Systemet identifierar vinnande samtalsmodeller och sprider best practices.",
      benefits: [
        "Förbättrar säljprestanda med 30%",
        "Minskar onboarding-tid för nya säljare med 50%",
        "Identifierar framgångsrika samtalsmönster",
        "Ger objektiv feedback och utvecklingsområden"
      ],
      tools: [
        { name: "Gong.io", description: "Marknadsledande samtalsanalys och coaching", price: "från 12,000 SEK/månad" },
        { name: "Chorus.ai", description: "AI-driven samtalsinsikt och coaching", price: "från 10,000 SEK/månad" },
        { name: "Wingman", description: "Realtids säljcoaching under samtal", price: "från 6,000 SEK/månad" }
      ],
      implementation: {
        week1: "Installation och integrering med telefon/videosystem",
        week2: "Baseline-mätning av nuvarande prestanda",
        week3: "Anpassning av coaching-program till er säljprocess",
        week4: "Lansering och första coaching-sessions"
      },
      timeSaved: "5-7 timmar/vecka",
      roi: "200,000 SEK/år"
    },
    {
      title: "Intelligent offerhantering",
      problem: "Att skapa anpassade offerter tar 2-3 timmar per offert och innehåller ofta fel eller inkonsekvent prissättning",
      solution: "AI-system som automatiskt genererar anpassade offerter baserat på kundbehov, historisk data och aktuell prissättning. Systemet säkerställer konsekvent messaging och optimerad prissättning.",
      benefits: [
        "Minskar offerttid från 3 timmar till 15 minuter",
        "Eliminerar prissättningsfel med 95%",
        "Ökar acceptansgraden med 20%",
        "Möjliggör dynamisk prissättning"
      ],
      tools: [
        { name: "PandaDoc", description: "AI-driven dokumentautomation", price: "från 1,000 SEK/månad" },
        { name: "Proposify", description: "Smart offerthantering med AI", price: "från 800 SEK/månad" },
        { name: "DealHub", description: "CPQ och offertoptimering", price: "Custom pricing" }
      ],
      implementation: {
        week1: "Mallskapande och regeluppsättning",
        week2: "Integration med CRM och prissystem",
        week3: "AI-träning på historiska vinnande offerter",
        week4: "Pilottest och finjustering"
      },
      timeSaved: "6-8 timmar/vecka",
      roi: "120,000 SEK/år"
    },
    {
      title: "Prediktiv säljanalys",
      problem: "Säljprognoser baseras på magkänsla snarare än data, vilket leder till felaktiga beslut och resurstilldelning",
      solution: "AI analyserar historisk data, pipelineaktivitet och externa faktorer för att ge exakta säljprognoser. Systemet varnar för risker och identifierar möjligheter i realtid.",
      benefits: [
        "Ökar prognosträffsäkerhet till 90%+",
        "Identifierar at-risk deals 3 veckor tidigare",
        "Optimerar resurstilldelning",
        "Förutser säsongsvariationer"
      ],
      tools: [
        { name: "Clari", description: "AI-driven revenue operations", price: "från 5,000 SEK/månad" },
        { name: "InsightSquared", description: "Prediktiv säljanalys", price: "från 3,000 SEK/månad" },
        { name: "Aviso", description: "AI för säljprognoser", price: "Custom pricing" }
      ],
      implementation: {
        week1: "Dataintegration från alla säljsystem",
        week2: "Historisk dataanalys och modellbygge",
        week3: "Dashboard-uppsättning och varningssystem",
        week4: "Utbildning av säljledning"
      },
      timeSaved: "4-5 timmar/vecka",
      roi: "180,000 SEK/år"
    },
    {
      title: "Automatiserad kunduppföljning",
      problem: "Manuell uppföljning av kunder leder till missade möjligheter och inkonsekvent kundupplevelse",
      solution: "AI-system som automatiskt schemalägger och personaliserar uppföljningar baserat på kundbeteende och säljcykelstadium. Systemet säkerställer att ingen lead glöms bort.",
      benefits: [
        "100% uppföljningsgrad på alla leads",
        "Ökar responsgrad med 45%",
        "Förkortar säljcykeln med 20%",
        "Frigör 2 timmar/dag för värdeskapande aktiviteter"
      ],
      tools: [
        { name: "Outreach.io", description: "Sales engagement platform", price: "från 4,000 SEK/månad" },
        { name: "Salesloft", description: "AI-driven säljkommunikation", price: "från 3,500 SEK/månad" },
        { name: "Reply.io", description: "Automatiserad outreach", price: "från 1,500 SEK/månad" }
      ],
      implementation: {
        week1: "Mappning av uppföljningsprocesser",
        week2: "Skapande av personaliseringsmallar",
        week3: "Automatiseringsregler och A/B-tester",
        week4: "Lansering och optimering"
      },
      timeSaved: "10-12 timmar/vecka",
      roi: "250,000 SEK/år"
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return <LoadingAnalysis />;
  }

  const tabs = [
    { id: "solutions" as const, label: "AI-lösningar", count: solutions.length },
    { id: "tools" as const, label: "Verktyg", count: 15 },
    { id: "implementation" as const, label: "Implementering", count: null },
    { id: "roi" as const, label: "ROI-kalkyl", count: null }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Er AI-strategi för {dept === "sales" ? "säljteamet" : dept}
          </h1>
          <p className="text-xl text-gray-600">
            Konkreta lösningar som frigör tid och ökar effektiviteten
          </p>
        </div>

        {/* Key metrics - minimal style */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-500">Tidsbesparing</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalTimeSaved}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-500">Årlig ROI</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalROI}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p className="text-sm text-gray-500">AI-lösningar</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{solutions.length} st</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="font-medium">{tab.label}</span>
              {tab.count && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "solutions" && (
          <div className="space-y-6">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {solution.title}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {solution.problem}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-700">{solution.timeSaved}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-700">{solution.roi}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedCard === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedCard === index && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-6 space-y-6">
                      {/* Solution description */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Lösning</h4>
                        <p className="text-gray-600">{solution.solution}</p>
                      </div>

                      {/* Benefits */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Fördelar</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {solution.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended tools */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Rekommenderade verktyg</h4>
                        <div className="space-y-3">
                          {solution.tools.map((tool, i) => (
                            <div key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{tool.name}</p>
                                <p className="text-sm text-gray-600">{tool.description}</p>
                              </div>
                              <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{tool.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Implementation plan */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Implementeringsplan</h4>
                        <div className="space-y-2">
                          {Object.entries(solution.implementation).map(([week, task]) => (
                            <div key={week} className="flex gap-3">
                              <span className="font-medium text-gray-700 capitalize">{week}:</span>
                              <span className="text-gray-600">{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "tools" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600">Verktygsöversikt kommer snart...</p>
          </div>
        )}

        {activeTab === "implementation" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">12-veckors implementeringsplan</h3>
            <p className="text-gray-600">Detaljerad plan kommer snart...</p>
          </div>
        )}

        {activeTab === "roi" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">ROI-kalkyl</h3>
            <p className="text-gray-600">Detaljerad kalkyl kommer snart...</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gray-900 text-white rounded-2xl p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Redo att transformera ert team med AI?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Få en komplett implementeringsplan med allt ni behöver för att lyckas
            </p>
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Från</div>
                <div className="text-4xl font-bold">249€</div>
                <div className="text-sm text-gray-400">Välj plan →</div>
              </div>
              <button
                onClick={() => router.push("/business/checkout")}
                className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
              >
                Se våra planer
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BusinessResultsPage() {
  return (
    <Suspense fallback={<LoadingAnalysis />}>
      <BusinessResultsContent />
    </Suspense>
  );
}