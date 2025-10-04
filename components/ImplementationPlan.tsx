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
    <div className="mt-8 p-8 bg-gray-50 rounded-3xl">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-light text-gray-900 mb-2">
          Din 30-dagars implementeringsplan
        </h3>
        <p className="text-gray-600">
          Steg för steg mot ett mer effektivt arbetssätt
        </p>
      </div>

      <div className="grid gap-4">
        {weeklyPlan.map((week) => (
          <div
            key={week.week}
            className={`bg-white rounded-2xl border transition-all duration-300 ${
              expandedWeek === week.week 
                ? 'border-gray-300 shadow-md' 
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <button
              onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
              className="w-full p-6 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-medium">
                    V{week.week}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{week.title}</h4>
                    <p className="text-sm text-gray-600">Fokus: {week.focus}</p>
                  </div>
                </div>
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
            </button>

            {expandedWeek === week.week && (
              <div className="px-6 pb-6 animate-fade-in-up">
                <div className="pl-16">
                  <ul className="space-y-3">
                    {week.tasks.map((task, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-gray-600">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{task}</span>
                      </li>
                    ))}
                  </ul>

                  {week.week === 1 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tips:</strong> Börja smått! 15 minuter om dagen räcker för att komma igång.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
