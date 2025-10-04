"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessDemoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"solutions" | "tools" | "implementation" | "roi">("solutions");
  const [expandedCard, setExpandedCard] = useState<number | null>(0); // First card expanded by default

  const dept = "Försäljning";
  const companySize = "Scale-up (10-50 anställda)";
  const industry = "Tech & SaaS";
  const totalTimeSaved = "20-30 timmar per vecka";
  const totalROI = "450,000 - 600,000 SEK/år";

  const solutions = [
    {
      title: "Automatiserad leadkvalificering med AI",
      problem: "Säljteamet spenderar 8-10 timmar per vecka på att manuellt granska och kvalificera inkommande leads från olika källor (hemsida, LinkedIn, events). Detta tar tid från faktisk försäljning.",
      solution: "Implementera ett AI-system som automatiskt analyserar och poängsätter varje lead baserat på företagsstorlek, bransch, beteende på hemsidan, och historiska köpmönster. Systemet integreras med ert CRM och prioriterar automatiskt de mest lovande leads.",
      benefits: [
        "Ökar kvalificerade leads med 40% genom bättre identifiering",
        "Minskar tid per lead från 15 minuter till 2 minuter",
        "Förbättrar konverteringsgraden med 25%",
        "Identifierar köpsignaler i realtid (t.ex. prissidobesök, demo-förfrågan)"
      ],
      tools: [
        { name: "Leadfeeder", description: "Identifierar företag som besöker er hemsida och visar deras beteende", price: "från 1,200 SEK/månad" },
        { name: "Clay.com", description: "AI-driven dataanrikning och automatisk leadscoring", price: "från 1,500 SEK/månad" },
        { name: "Clearbit", description: "Automatisk företags- och kontaktdata för alla leads", price: "från 2,000 SEK/månad" }
      ],
      implementation: {
        week1: "Kartlägg nuvarande leadkällor och integrera datakällor (CRM, hemsida, LinkedIn)",
        week2: "AI-modell tränas på era historiska leads och köpbeslut",
        week3: "CRM-integration och automatiska notifikationer sätts upp",
        week4: "Teamutbildning och finjustering av scoring-kriterier"
      },
      timeSaved: "8-10 timmar/vecka",
      roi: "150,000 SEK/år"
    },
    {
      title: "AI-driven säljcoaching och samtalsanalys",
      problem: "Ingen systematisk analys av säljsamtal innebär att värdefulla insikter går förlorade. Nya säljare tar 6+ månader att komma upp i full produktivitet.",
      solution: "AI som automatiskt spelar in, transkriberar och analyserar alla säljsamtal. Systemet ger realtidsförslag under samtal, identifierar vinnande mönster och skapar personliga utvecklingsplaner för varje säljare.",
      benefits: [
        "Förbättrar säljprestanda med 30% genom datadrivna insikter",
        "Minskar onboarding-tid för nya säljare från 6 till 3 månader",
        "Identifierar framgångsrika samtalsmönster och invändningshantering",
        "Ger objektiv feedback baserad på faktiska samtal, inte magkänsla"
      ],
      tools: [
        { name: "Gong.io", description: "Marknadsledande samtalsanalys med AI-coaching", price: "från 12,000 SEK/månad" },
        { name: "Chorus.ai", description: "AI-driven samtalsinsikt och team-coaching", price: "från 10,000 SEK/månad" },
        { name: "Wingman", description: "Realtids säljcoaching under pågående samtal", price: "från 6,000 SEK/månad" }
      ],
      implementation: {
        week1: "Installation och integrering med telefon/videosystem (Zoom, Teams, etc.)",
        week2: "Baseline-mätning av nuvarande prestanda och samtalskvalitet",
        week3: "Anpassning av coaching-program till er specifika säljprocess",
        week4: "Lansering, första coaching-sessions och feedback-loopar"
      },
      timeSaved: "5-7 timmar/vecka",
      roi: "200,000 SEK/år"
    },
    {
      title: "Intelligent offerhantering och prissättning",
      problem: "Att skapa anpassade offerter tar 2-3 timmar per offert. Prissättning är inkonsekvent och innehåller ofta fel som kostar pengar.",
      solution: "AI-system som automatiskt genererar professionella, anpassade offerter baserat på kundbehov, historisk data och konkurrenssituation. Systemet optimerar prissättning dynamiskt och säkerställer konsekvent messaging.",
      benefits: [
        "Minskar offerttid från 3 timmar till 15 minuter per offert",
        "Eliminerar prissättningsfel med 95%",
        "Ökar acceptansgraden med 20% genom optimerad prissättning",
        "Möjliggör dynamisk prissättning baserad på marknadssituation"
      ],
      tools: [
        { name: "PandaDoc", description: "AI-driven dokumentautomation och e-signering", price: "från 1,000 SEK/månad" },
        { name: "Proposify", description: "Smart offerthantering med AI-optimering", price: "från 800 SEK/månad" },
        { name: "DealHub", description: "CPQ (Configure-Price-Quote) med AI", price: "Custom pricing" }
      ],
      implementation: {
        week1: "Mallskapande och regeluppsättning för olika kundtyper",
        week2: "Integration med CRM och prissystem",
        week3: "AI-träning på historiska vinnande offerter",
        week4: "Pilottest med 5-10 offerter och finjustering"
      },
      timeSaved: "6-8 timmar/vecka",
      roi: "120,000 SEK/år"
    },
    {
      title: "Prediktiv säljanalys och pipeline-optimering",
      problem: "Säljprognoser baseras på magkänsla vilket leder till felaktiga beslut om resurstilldelning och budgetering. Deals faller igenom utan förvarning.",
      solution: "AI analyserar historisk data, pipelineaktivitet, e-postengagemang och externa faktorer för att ge exakta säljprognoser. Systemet varnar för at-risk deals och identifierar möjligheter i realtid.",
      benefits: [
        "Ökar prognosträffsäkerhet från 60% till 90%+",
        "Identifierar at-risk deals 3 veckor tidigare",
        "Optimerar resurstilldelning baserat på deal-sannolikhet",
        "Förutser säsongsvariationer och marknadstrender"
      ],
      tools: [
        { name: "Clari", description: "AI-driven revenue operations och prognoser", price: "från 5,000 SEK/månad" },
        { name: "InsightSquared", description: "Prediktiv säljanalys och dashboards", price: "från 3,000 SEK/månad" },
        { name: "Aviso", description: "AI för säljprognoser och deal-scoring", price: "Custom pricing" }
      ],
      implementation: {
        week1: "Dataintegration från alla säljsystem (CRM, email, kalender)",
        week2: "Historisk dataanalys och AI-modellbygge",
        week3: "Dashboard-uppsättning och automatiska varningssystem",
        week4: "Utbildning av säljledning och första prognoser"
      },
      timeSaved: "4-5 timmar/vecka",
      roi: "180,000 SEK/år"
    },
    {
      title: "Automatiserad kunduppföljning och nurturing",
      problem: "Manuell uppföljning av leads och kunder leder till missade möjligheter. 40% av leads får ingen uppföljning alls efter första kontakten.",
      solution: "AI-system som automatiskt schemalägger och personaliserar uppföljningar baserat på kundbeteende, säljcykelstadium och engagemangsnivå. Systemet säkerställer att ingen lead glöms bort.",
      benefits: [
        "100% uppföljningsgrad på alla leads (från 60%)",
        "Ökar responsgrad med 45% genom perfekt timing",
        "Förkortar säljcykeln med 20% genom konsekvent nurturing",
        "Frigör 10 timmar/vecka för värdeskapande aktiviteter"
      ],
      tools: [
        { name: "Outreach.io", description: "Sales engagement platform med AI", price: "från 4,000 SEK/månad" },
        { name: "Salesloft", description: "AI-driven säljkommunikation och sequences", price: "från 3,500 SEK/månad" },
        { name: "Reply.io", description: "Automatiserad outreach med personalisering", price: "från 1,500 SEK/månad" }
      ],
      implementation: {
        week1: "Mappning av nuvarande uppföljningsprocesser och pain points",
        week2: "Skapande av personaliseringsmallar och sequences",
        week3: "Automatiseringsregler och A/B-tester av meddelanden",
        week4: "Lansering och optimering baserat på responsdata"
      },
      timeSaved: "10-12 timmar/vecka",
      roi: "250,000 SEK/år"
    }
  ];

  const tabs = [
    { id: "solutions" as const, label: "AI-lösningar", count: solutions.length },
    { id: "tools" as const, label: "Verktyg", count: 15 },
    { id: "implementation" as const, label: "Implementering", count: null },
    { id: "roi" as const, label: "ROI-kalkyl", count: null }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Demo badge */}
        <div className="mb-8 text-center">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Demo-exempel för Tech & SaaS företag
          </span>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Er AI-strategi för säljteamet
          </h1>
          <p className="text-xl text-gray-600">
            Konkreta lösningar som frigör tid och ökar effektiviteten
          </p>
        </div>

        {/* Key metrics */}
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
                              <span className="font-medium text-gray-700 capitalize">{week.replace('week', 'Vecka ')}:</span>
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

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gray-900 text-white rounded-2xl p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Vill ni ha en skräddarsydd analys för ert företag?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Svara på några frågor och få konkreta AI-lösningar för just er verksamhet
            </p>
            <button
              onClick={() => router.push("/business")}
              className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Starta er AI-resa →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
