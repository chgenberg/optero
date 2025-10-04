"use client";

import { useState, useEffect } from "react";

interface PremiumUpgradeProps {
  profession: string;
  specialization: string;
  onUpgrade: () => void;
}

export default function PremiumUpgrade({ profession, specialization, onUpgrade }: PremiumUpgradeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [preparingQuestions, setPreparingQuestions] = useState(false);
  const [questionsReady, setQuestionsReady] = useState(false);

  useEffect(() => {
    // Prepare questions in the background when component mounts
    prepareQuestions();
  }, [profession, specialization]);

  const prepareQuestions = async () => {
    setPreparingQuestions(true);
    try {
      const response = await fetch("/api/premium/prepare-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession,
          specialization,
          tasks: [], // We can pass tasks if we have them
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store questions in session storage for later use
        sessionStorage.setItem("premiumQuestions", JSON.stringify(data));
        setQuestionsReady(true);
      }
    } catch (error) {
      console.error("Failed to prepare questions:", error);
    } finally {
      setPreparingQuestions(false);
    }
  };

  const handleUpgrade = () => {
    // Store current context for premium flow
    sessionStorage.setItem("premiumContext", JSON.stringify({
      profession,
      specialization,
    }));
    onUpgrade();
  };

  return (
    <div className="relative">
      {/* Premium CTA - Minimal design */}
      <div className="bg-gray-900 text-white rounded-2xl p-6 lg:p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl lg:text-2xl font-bold mb-1">
              Få din personliga AI-guide
            </h3>
            <p className="text-gray-300 text-sm">
              Skräddarsydd analys för {specialization.toLowerCase()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">10€</div>
            <div className="text-xs text-gray-400">engångspris</div>
          </div>
        </div>

        {/* What's included */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">15-20 djupgående frågor om ditt arbete</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Komplett PDF-guide med steg-för-steg instruktioner</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Konkreta exempel anpassade för ditt yrke</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Beräknad tidsbesparing: 5-10h per vecka</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleUpgrade}
          disabled={preparingQuestions}
          className="w-full bg-white text-gray-900 py-3 px-6 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {preparingQuestions ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              <span>Förbereder...</span>
            </>
          ) : (
            <>
              <span>Kom igång nu</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>

        {/* Trust badges */}
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Säker betalning
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            Direkt tillgång
          </div>
        </div>

        {questionsReady && (
          <div className="mt-2 text-center text-xs text-green-400">
            ✓ Frågor förbereds för dig
          </div>
        )}
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full mt-4 text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
      >
        <span>Vad ingår exakt?</span>
        <svg 
          className={`w-4 h-4 transition-transform ${showDetails ? "rotate-180" : ""}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDetails && (
        <div className="mt-4 p-6 bg-gray-50 rounded-xl animate-fade-in">
          <h4 className="font-semibold text-gray-900 mb-4">Komplett Premium-paket inkluderar:</h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-1">1. Djupgående intervju (10-15 min)</h5>
              <p className="text-sm text-gray-600">
                15-20 skräddarsydda frågor som kartlägger exakt hur du arbetar, vilka utmaningar du har, 
                och var AI kan göra störst skillnad för just dig.
              </p>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-1">2. Personlig AI-guide (PDF)</h5>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Steg-för-steg instruktioner för varje verktyg</li>
                <li>• Konkreta exempel från ditt arbetsområde</li>
                <li>• Färdiga prompts du kan kopiera</li>
                <li>• Tidsbesparingsberäkningar</li>
                <li>• Implementeringsplan vecka för vecka</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-1">3. Interaktiv resultatssida</h5>
              <p className="text-sm text-gray-600">
                Mer detaljerade rekommendationer, fler användningsfall, och praktiska övningar 
                för att komma igång direkt.
              </p>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-1">4. 30 dagars uppföljning</h5>
              <p className="text-sm text-gray-600">
                Möjlighet att ställa följdfrågor och få hjälp med implementeringen via email.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>100% nöjd-garanti:</strong> Om du inte är nöjd med din personliga AI-guide 
              får du pengarna tillbaka. Inga krångliga villkor.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}