"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoadingFact {
  sv: string;
  en: string;
  es: string;
  fr: string;
}

const LOADING_FACTS: LoadingFact[] = [
  {
    sv: "Visste du att 65% av alla kontorsarbetare kan spara minst 5 timmar per vecka med AI?",
    en: "Did you know that 65% of office workers can save at least 5 hours per week with AI?",
    es: "¿Sabías que el 65% de los trabajadores de oficina pueden ahorrar al menos 5 horas por semana con IA?",
    fr: "Saviez-vous que 65% des employés de bureau peuvent économiser au moins 5 heures par semaine avec l'IA?"
  },
  {
    sv: "ChatGPT har över 180 miljoner användare världen över och växer varje dag.",
    en: "ChatGPT has over 180 million users worldwide and growing every day.",
    es: "ChatGPT tiene más de 180 millones de usuarios en todo el mundo y crece cada día.",
    fr: "ChatGPT compte plus de 180 millions d'utilisateurs dans le monde et croît chaque jour."
  },
  {
    sv: "AI kan automatisera upp till 40% av repetitiva arbetsuppgifter inom de flesta yrken.",
    en: "AI can automate up to 40% of repetitive tasks in most professions.",
    es: "La IA puede automatizar hasta el 40% de las tareas repetitivas en la mayoría de las profesiones.",
    fr: "L'IA peut automatiser jusqu'à 40% des tâches répétitives dans la plupart des professions."
  },
  {
    sv: "Företag som använder AI-verktyg rapporterar 30% högre produktivitet i genomsnitt.",
    en: "Companies using AI tools report 30% higher productivity on average.",
    es: "Las empresas que usan herramientas de IA reportan un 30% más de productividad en promedio.",
    fr: "Les entreprises utilisant des outils IA rapportent une productivité 30% plus élevée en moyenne."
  },
  {
    sv: "94% av företagsledare säger att AI kommer vara kritiskt för deras framgång inom 5 år.",
    en: "94% of business leaders say AI will be critical to their success within 5 years.",
    es: "El 94% de los líderes empresariales dicen que la IA será crítica para su éxito en 5 años.",
    fr: "94% des dirigeants d'entreprise affirment que l'IA sera essentielle à leur succès d'ici 5 ans."
  },
  {
    sv: "En genomsnittlig knowledge worker spenderar 2.5 timmar per dag på att söka information.",
    en: "An average knowledge worker spends 2.5 hours per day searching for information.",
    es: "Un trabajador del conocimiento promedio pasa 2.5 horas al día buscando información.",
    fr: "Un travailleur du savoir moyen passe 2,5 heures par jour à chercher des informations."
  }
];

export default function LoadingAnalysis() {
  const { t, locale } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    // Smooth progress animation that speeds up over time
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          // Slow down near the end (waiting for actual data)
          return prev + 0.1;
        } else if (prev >= 80) {
          return prev + 0.5;
        } else if (prev >= 50) {
          return prev + 1;
        } else {
          return prev + 2;
        }
      });
    }, 100);

    // Change fact every 8 seconds (faster rotation)
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % LOADING_FACTS.length);
    }, 8000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(factInterval);
    };
  }, []);

  const currentFact = LOADING_FACTS[currentFactIndex];

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        {/* Loading text */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            {t('results.loading')}
          </h3>
          <p className="text-gray-600">
            {progress < 30 && "Samlar information om ditt yrke..."}
            {progress >= 30 && progress < 60 && "Analyserar dina arbetsuppgifter..."}
            {progress >= 60 && progress < 90 && "Hittar de bästa AI-verktygen för dig..."}
            {progress >= 90 && "Skapar din personliga guide..."}
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gray-900 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              {/* Pulsing effect */}
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-6 left-0 text-sm text-gray-500">
            {Math.round(Math.min(progress, 100))}%
          </div>
        </div>

        {/* Interesting fact */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-gray-700 leading-relaxed">
              {currentFact[locale as keyof LoadingFact]}
            </p>
          </div>
        </div>

        {/* Loading animation */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gray-900 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}