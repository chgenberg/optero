"use client";

import { useState, useEffect } from "react";

const PREMIUM_FACTS = [
  "AI kan spara dig 5-15 timmar varje vecka...",
  "ChatGPT kan skriva en rapport på 10 minuter som tar 2 timmar manuellt...",
  "85% av repetitiva uppgifter kan automatiseras med AI...",
  "Din personliga guide innehåller 15+ AI-verktyg...",
  "Vi analyserar dina svar för att hitta de bästa lösningarna...",
  "Premium-analysen är 10x mer detaljerad än gratisversionen...",
  "Din PDF-guide blir 20-30 sidor med konkreta exempel...",
  "AI-Coach hjälper dig implementera allt steg för steg...",
  "Genomsnittlig ROI: 2,000-6,000 kr/månad i tidsbesparing...",
  "92% av användare sparar minst 8 timmar/vecka med våra rekommendationer...",
  "Vi skapar en 4-veckors plan skräddarsydd för just dig...",
  "Varje verktyg får detaljerade instruktioner och exempel...",
  "Din analys baseras på hundratals liknande yrkesroller...",
  "AI kan hantera 70% av din administration automatiskt...",
  "Premium-guiden inkluderar färdiga prompts att kopiera direkt...",
];

export default function PremiumLoading() {
  const [progress, setProgress] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const [displayedFacts, setDisplayedFacts] = useState<number[]>([0]);

  useEffect(() => {
    // Progress bar: 0-100% over 3 minutes (180 seconds)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / 180); // Increment every second for 3 minutes
      });
    }, 1000);

    // Change fact every 12 seconds
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => {
        const next = (prev + 1) % PREMIUM_FACTS.length;
        setDisplayedFacts((prevFacts) => {
          if (prevFacts.length >= 5) {
            return [...prevFacts.slice(1), next];
          }
          return [...prevFacts, next];
        });
        return next;
      });
    }, 12000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(factInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Animated border container - same as hero */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-3xl opacity-75 group-hover:opacity-100 blur-sm transition duration-1000 group-hover:duration-200 animate-gradient-x overflow-hidden"></div>
          
          {/* Main card */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-white rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Skapar din premium-analys
            </h2>
            <p className="text-gray-600">
              Detta tar 2-3 minuter. Vi genererar en omfattande rapport med 15-25 sidor...
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Analyserar dina svar</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-all duration-1000 ease-linear relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="space-y-3 mb-8">
            <div className={`flex items-center gap-3 transition-all duration-500 ${progress > 10 ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress > 10 ? 'bg-gray-900' : 'bg-gray-200'}`}>
                {progress > 10 ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <span className="text-sm text-gray-700">Analyserar dina svar och arbetsuppgifter</span>
            </div>

            <div className={`flex items-center gap-3 transition-all duration-500 ${progress > 30 ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress > 30 ? 'bg-gray-900' : 'bg-gray-200'}`}>
                {progress > 30 ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <span className="text-sm text-gray-700">Identifierar AI-möjligheter för ditt yrke</span>
            </div>

            <div className={`flex items-center gap-3 transition-all duration-500 ${progress > 50 ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress > 50 ? 'bg-gray-900' : 'bg-gray-200'}`}>
                {progress > 50 ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <span className="text-sm text-gray-700">Skapar personliga AI-verktygsrekommendationer</span>
            </div>

            <div className={`flex items-center gap-3 transition-all duration-500 ${progress > 70 ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress > 70 ? 'bg-gray-900' : 'bg-gray-200'}`}>
                {progress > 70 ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <span className="text-sm text-gray-700">Bygger din 4-veckors implementeringsplan</span>
            </div>

            <div className={`flex items-center gap-3 transition-all duration-500 ${progress > 85 ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress > 85 ? 'bg-gray-900' : 'bg-gray-200'}`}>
                {progress > 85 ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <span className="text-sm text-gray-700">Genererar din nedladdningsbara PDF-guide</span>
            </div>
          </div>

          {/* Interesting facts */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
              Visste du att...
            </p>
            <div className="space-y-3 min-h-[120px]">
              {displayedFacts.map((factIndex, i) => (
                <p
                  key={factIndex}
                  className={`text-gray-700 text-base leading-relaxed transition-all duration-500 ${
                    i === displayedFacts.length - 1 ? 'opacity-100 font-medium' : 'opacity-50'
                  }`}
                >
                  {PREMIUM_FACTS[factIndex]}
                </p>
              ))}
            </div>
          </div>

          {/* Time estimate */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Beräknad tid kvar: {Math.max(0, Math.ceil((100 - progress) * 1.8 / 60))} minuter
            </p>
          </div>
          </div>
        </div>
        
        {/* Bottom note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Stäng inte denna sida. Din analys genereras just nu...
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
