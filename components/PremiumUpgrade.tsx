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
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    // Prepare questions in the background when component mounts
    prepareQuestions();
    
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
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

  const handleUpgrade = async () => {
    // Store current context for premium flow
    sessionStorage.setItem("premiumContext", JSON.stringify({
      profession,
      specialization,
    }));

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/premium/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession,
          specialization,
          discountPrice,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        // Fallback to regular flow if Stripe is not configured
        console.error("Stripe not configured, using fallback");
        onUpgrade();
      }
    } catch (error) {
      console.error("Checkout error:", error);
      // Fallback to regular flow
      onUpgrade();
    }
  };

  // Format time left
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate discount price
  const originalPrice = 10;
  const discountPrice = timeLeft > 0 ? 7 : 10;
  const savings = originalPrice - discountPrice;

  return (
    <div className="relative">

      {/* Simple Premium CTA */}
      <div className="bg-gray-900 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">

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
            {timeLeft > 0 ? (
              <>
                <div className="text-sm text-gray-400 line-through">{originalPrice}€</div>
                <div className="text-3xl font-bold text-green-400">{discountPrice}€</div>
              </>
            ) : (
              <div className="text-3xl font-bold">{originalPrice}€</div>
            )}
            <div className="text-xs text-gray-400">engångspris</div>
          </div>
        </div>

        {/* What's included - Enhanced */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">15+ AI-verktyg (istället för 3 i gratisversionen)</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">50+ färdiga prompts för {profession.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">4-veckors implementeringsplan (värd 2,999kr)</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Personlig PDF-guide att ladda ner</span>
          </div>
        </div>

        {/* Comparison table button */}
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="w-full mb-4 text-sm text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 py-2 border border-gray-700 rounded-lg hover:border-gray-600"
        >
          <span>Jämför Gratis vs Premium</span>
          <svg 
            className={`w-4 h-4 transition-transform ${showComparison ? "rotate-180" : ""}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Comparison table */}
        {showComparison && (
          <div className="mb-6 bg-white/5 rounded-lg p-4 animate-fade-in">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 font-medium text-gray-300">Feature</th>
                  <th className="text-center py-2 font-medium text-gray-500">Gratis</th>
                  <th className="text-center py-2 font-medium text-green-400">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="py-2">AI-verktyg</td>
                  <td className="text-center">3</td>
                  <td className="text-center font-bold">15+</td>
                </tr>
                <tr>
                  <td className="py-2">Användningsscenarier</td>
                  <td className="text-center">2</td>
                  <td className="text-center font-bold">10+</td>
                </tr>
                <tr>
                  <td className="py-2">Färdiga prompts</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅ 50+</td>
                </tr>
                <tr>
                  <td className="py-2">Implementeringsplan</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-2">PDF-guide</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-2">Email-support</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅ 30 dagar</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* CTA Button - Enhanced */}
        <button
          onClick={handleUpgrade}
          disabled={preparingQuestions}
          className="w-full bg-white text-gray-900 py-4 px-6 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg"
        >
          {preparingQuestions ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              <span>Förbereder...</span>
            </>
          ) : (
            <>
              <span>{timeLeft > 0 ? `Spara ${savings}€ nu` : 'Kom igång nu'}</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>

        {/* Social proof */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-900"></div>
              <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-gray-900"></div>
              <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900"></div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-300">
                <span className="font-semibold">Sarah, Projektledare:</span> "Betalade {discountPrice}€, sparar nu 12h/vecka. 
                Bästa investeringen jag gjort!"
              </p>
              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>

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
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Nöjd-garanti
          </div>
        </div>

        {questionsReady && (
          <div className="mt-2 text-center text-xs text-green-400 animate-pulse">
            ✓ Dina frågor är redo - starta direkt efter betalning
          </div>
        )}
      </div>
    </div>
  );
}