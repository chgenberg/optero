"use client";

import { useState } from "react";

interface ImplementationPlanProps {
  recommendations: any[];
  profession: string;
  specialization: string;
}

interface WeekPlan {
  week: number;
  title: string;
  tasks: string[];
  focus: string;
}

export default function ImplementationPlan({ recommendations, profession, specialization }: ImplementationPlanProps) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  // Generera en 4-veckors plan baserat på rekommendationerna
  const weeklyPlan: WeekPlan[] = [
    {
      week: 1,
      title: "Upptäck & Utforska",
      focus: recommendations[0]?.name || "Huvudverktyget",
      tasks: [
        `Registrera dig för ${recommendations[0]?.name || "det första verktyget"}`,
        "Titta på introduktionsvideor och tutorials",
        "Testa grundläggande funktioner i 15-30 min/dag",
        "Identifiera 2-3 användningsområden i ditt arbete"
      ]
    },
    {
      week: 2,
      title: "Praktisk tillämpning",
      focus: "Integration i arbetsflödet",
      tasks: [
        `Använd ${recommendations[0]?.name} för en verklig arbetsuppgift`,
        `Börja utforska ${recommendations[1]?.name || "nästa verktyg"}`,
        "Dokumentera tidsbesparingar",
        "Dela erfarenheter med en kollega"
      ]
    },
    {
      week: 3,
      title: "Expandera & Optimera",
      focus: "Flera verktyg",
      tasks: [
        `Testa minst 3 av de rekommenderade verktygen`,
        "Jämför vilket som passar bäst för olika uppgifter",
        "Skapa mallar eller snabbkommandon",
        "Mät faktisk tidsbesparing"
      ]
    },
    {
      week: 4,
      title: "Etablera rutiner",
      focus: "Långsiktig användning",
      tasks: [
        "Integrera AI-verktyg i dina dagliga rutiner",
        "Dela framgångar med teamet",
        "Planera fortsatt lärande",
        "Utvärdera ROI och nästa steg"
      ]
    }
  ];

  return (
    <div className="mt-8 p-4 sm:p-8 bg-gray-50 rounded-2xl sm:rounded-3xl">
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-2">
          Din 30-dagars implementeringsplan
        </h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Steg för steg mot ett mer effektivt arbetssätt
        </p>
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        {weeklyPlan.map((week) => (
          <div
            key={week.week}
            className={`bg-white rounded-2xl lg:rounded-3xl border border-gray-100 shadow-xl transition-all duration-300 ${
              expandedWeek === week.week 
                ? 'shadow-2xl' 
                : 'hover:shadow-2xl'
            }`}
          >
            <button
              onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
              className="w-full p-6 sm:p-8 lg:p-10 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg">
                    V{week.week}
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{week.title}</h4>
                    <p className="text-sm sm:text-base text-gray-600">
                      <span className="font-medium">Fokus:</span> {week.focus}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                    Sparar 2-3 timmar
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      expandedWeek === week.week ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {expandedWeek === week.week && (
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 animate-fade-in-up">
                <div className="grid gap-6 sm:grid-cols-2">
                  {week.tasks.map((task, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium mb-1">{task}</p>
                          <p className="text-xs text-gray-500">
                            {index === 0 && "Börja här"}
                            {index === 1 && "Bygg vidare"}
                            {index === 2 && "Fördjupa"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {week.week === 1 && (
                  <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm sm:text-base text-gray-800">
                      <span className="text-2xl mr-2">💡</span>
                      <strong>Tips för veckan:</strong> Börja smått! Dedikera bara 15-20 minuter per dag för att bygga vanan. Fokusera på en uppgift i taget.
                    </p>
                  </div>
                )}

                {week.week === 2 && (
                  <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm sm:text-base text-gray-800">
                      <span className="text-2xl mr-2">🚀</span>
                      <strong>Nu ökar vi tempot:</strong> Du har grunderna på plats. Denna vecka automatiserar vi fler arbetsflöden.
                    </p>
                  </div>
                )}

                {week.week === 3 && (
                  <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm sm:text-base text-gray-800">
                      <span className="text-2xl mr-2">✨</span>
                      <strong>Avancerade tekniker:</strong> Dags att ta din AI-användning till nästa nivå med kraftfulla arbetsflöden.
                    </p>
                  </div>
                )}

                {week.week === 4 && (
                  <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm sm:text-base text-gray-800">
                      <span className="text-2xl mr-2">🎯</span>
                      <strong>Sista pushen:</strong> Optimera och finjustera dina AI-rutiner för maximal effektivitet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
