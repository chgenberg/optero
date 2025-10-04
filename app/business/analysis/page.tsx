"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

// Department-specific questions (samma som tidigare)
const DEPARTMENT_QUESTIONS: Record<string, Array<{question: string, type: "text" | "number" | "select" | "scale", options?: string[]}>> = {
  "sales": [
    { question: "Hur många säljare har ni i teamet?", type: "number" },
    { question: "Vad är er genomsnittliga deal-size? (SEK)", type: "number" },
    { question: "Hur lång är er genomsnittliga säljcykel? (dagar)", type: "number" },
    { question: "Vilket CRM-system använder ni?", type: "select", options: ["Salesforce", "HubSpot", "Pipedrive", "Microsoft Dynamics", "Annat", "Inget"] },
    { question: "Hur många timmar per vecka spenderar varje säljare på administration?", type: "scale" },
    { question: "Hur genererar ni leads idag?", type: "text" },
    { question: "Hur kvalificerar ni leads innan kontakt?", type: "text" },
    { question: "Hur många cold outreach-emails skickar ni per vecka?", type: "number" },
    { question: "Vad är er genomsnittliga konverteringsgrad? (%)", type: "number" },
    { question: "Hur skapar ni offerter idag?", type: "text" },
    { question: "Hur lång tid tar det att skapa en anpassad offert? (timmar)", type: "scale" },
    { question: "Hur följer ni upp kundkontakter?", type: "text" },
    { question: "Hur ofta har ni säljmöten/uppföljningar?", type: "select", options: ["Dagligen", "Varje vecka", "Varannan vecka", "Månadsvis", "Sällan"] },
    { question: "Vilka verktyg använder ni för prospecting?", type: "text" },
    { question: "Hur onboardar ni nya kunder?", type: "text" },
    { question: "Hur hanterar ni avtalsförhandlingar?", type: "text" },
    { question: "Hur mäter ni säljprestanda?", type: "text" },
    { question: "Vilka är era största utmaningar i säljprocessen?", type: "text" },
    { question: "Hur mycket tid spenderar säljare på att uppdatera CRM?", type: "scale" },
    { question: "Hur analyserar ni förlorade deals?", type: "text" },
  ],
  "marketing": [
    { question: "Hur många personer jobbar med marknadsföring?", type: "number" },
    { question: "Vad är er månatliga marknadsbudget? (SEK)", type: "number" },
    { question: "Vilka kanaler använder ni mest?", type: "text" },
    { question: "Hur skapar ni innehåll idag?", type: "text" },
    { question: "Hur många innehållspublikationer gör ni per vecka?", type: "number" },
    { question: "Hur lång tid tar det att skapa ett blogginlägg?", type: "scale" },
    { question: "Hur hanterar ni social media?", type: "text" },
    { question: "Vilka verktyg använder ni för marknadsföring?", type: "text" },
    { question: "Hur mäter ni marknadsföringens ROI?", type: "text" },
    { question: "Hur ofta gör ni kampanjer?", type: "select", options: ["Varje vecka", "Varje månad", "Kvartalsvis", "Sällan"] },
    { question: "Hur skapar ni annonstexter?", type: "text" },
    { question: "Hur mycket tid spenderar ni på att designa grafik?", type: "scale" },
    { question: "Hur analyserar ni kampanjresultat?", type: "text" },
    { question: "Hur segmenterar ni er målgrupp?", type: "text" },
    { question: "Hur personaliserar ni kommunikation?", type: "text" },
    { question: "Vilka är era största marknadsföringsutmaningar?", type: "text" },
    { question: "Hur hanterar ni email-marknadsföring?", type: "text" },
    { question: "Hur ofta uppdaterar ni er hemsida?", type: "select", options: ["Dagligen", "Varje vecka", "Månadsvis", "Sällan"] },
    { question: "Hur arbetar ni med SEO?", type: "text" },
    { question: "Hur skapar ni case studies och kundberättelser?", type: "text" },
  ],
  // ... andra avdelningar samma frågor som tidigare
};

// Time scale options
const TIME_SCALE = [
  { value: 1, label: "< 1h", color: "from-green-400 to-green-500" },
  { value: 2, label: "1-3h", color: "from-yellow-400 to-yellow-500" },
  { value: 3, label: "3-5h", color: "from-orange-400 to-orange-500" },
  { value: 4, label: "5-10h", color: "from-red-400 to-red-500" },
  { value: 5, label: "> 10h", color: "from-purple-400 to-purple-500" },
];

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  const dept = searchParams?.get("dept") || "";
  const size = searchParams?.get("size") || "";
  const industry = searchParams?.get("industry") || "";
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const questions = DEPARTMENT_QUESTIONS[dept] || DEPARTMENT_QUESTIONS["sales"];
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleNext = () => {
    setAnswers({...answers, [currentQuestion]: currentAnswer});
    
    if (currentQuestion < questions.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setCurrentAnswer("");
        setIsAnimating(false);
      }, 300);
    } else {
      // Save and go to results
      sessionStorage.setItem("businessAnalysis", JSON.stringify({
        dept,
        size,
        industry,
        answers,
      }));
      setIsAnimating(true);
      setTimeout(() => {
        router.push("/business/results");
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setCurrentAnswer(answers[currentQuestion - 1] || "");
        setIsAnimating(false);
      }, 300);
    } else {
      router.back();
    }
  };

  if (!dept || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Ingen avdelning vald</p>
          <button
            onClick={() => router.push("/business")}
            className="mt-4 btn-primary"
          >
            Tillbaka
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-40 left-20 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-40 right-20 w-[30rem] h-[30rem] bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Progress bar - more visual */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gray-200/50 backdrop-blur-sm z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-700 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-shimmer" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-4xl relative z-10">
        {/* Question counter - more visual */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-100">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all group"
            >
              <svg className="w-5 h-5 text-gray-600 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-sm font-medium text-gray-600">
              Fråga <span className="text-2xl font-bold text-gray-900 mx-1">{currentQuestion + 1}</span> av {questions.length}
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => {
                const questionIndex = Math.floor((i * questions.length) / 5);
                const isActive = currentQuestion >= questionIndex;
                return (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      isActive ? "bg-gray-900 w-8" : "bg-gray-300"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Question card - more interactive */}
        <div className={`bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-relaxed">
              {question.question}
            </h2>

            {/* Different input types with better design */}
            {question.type === "text" && (
              <div className="relative">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-gray-900 focus:outline-none transition-all resize-none text-lg leading-relaxed"
                  rows={4}
                  placeholder="Beskriv så detaljerat som möjligt..."
                  autoFocus
                />
                <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                  {currentAnswer.length} tecken
                </div>
              </div>
            )}

            {question.type === "number" && (
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="number"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="w-full px-8 py-6 text-3xl font-bold text-center border-2 border-gray-200 rounded-2xl focus:border-gray-900 focus:outline-none transition-all"
                    placeholder="0"
                    autoFocus
                  />
                  <div className="mt-4 flex justify-center gap-4">
                    {[10, 25, 50, 100, 500].map((val) => (
                      <button
                        key={val}
                        onClick={() => setCurrentAnswer(String(val))}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {question.type === "select" && question.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {question.options.map((option, i) => (
                  <button
                    key={option}
                    onClick={() => setCurrentAnswer(option)}
                    className={`relative p-6 rounded-2xl border-2 transition-all transform hover:scale-105 group overflow-hidden ${
                      currentAnswer === option
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                    <span className="relative z-10 font-medium text-gray-900">{option}</span>
                    {currentAnswer === option && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center animate-scale-in">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {question.type === "scale" && (
              <div className="max-w-2xl mx-auto">
                <div className="flex justify-between gap-2">
                  {TIME_SCALE.map((scale, i) => (
                    <button
                      key={scale.value}
                      onClick={() => setCurrentAnswer(scale.label)}
                      className={`relative flex-1 py-8 rounded-2xl border-2 transition-all transform hover:scale-105 group overflow-hidden ${
                        currentAnswer === scale.label
                          ? "border-gray-900"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${scale.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                      <div className="relative z-10">
                        <p className="text-2xl font-bold mb-1">{scale.label}</p>
                        <p className="text-xs text-gray-600">per vecka</p>
                      </div>
                      {currentAnswer === scale.label && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center animate-scale-in">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons - more prominent */}
            <div className="flex gap-4 mt-12">
              <button
                onClick={handleNext}
                disabled={!currentAnswer}
                className="flex-1 py-5 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-xl group"
              >
                <span className="flex items-center justify-center gap-2">
                  {currentQuestion < questions.length - 1 ? (
                    <>
                      Nästa fråga
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Få er AI-strategi
                      <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Tips section - contextual */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">Tips:</strong> Ju mer detaljerat ni svarar, desto mer specifika och värdefulla blir era AI-rekommendationer.
              </p>
            </div>
          </div>
        </div>

        {/* Motivational message */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm animate-fade-in">
            {currentQuestion < 5 && "Bara några frågor till för att förstå era behov..."}
            {currentQuestion >= 5 && currentQuestion < 15 && "Halvvägs där! Era svar hjälper oss skapa perfekta lösningar..."}
            {currentQuestion >= 15 && "Nästan klart! Snart får ni er skräddarsydda AI-strategi..."}
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes scale-in {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s linear infinite; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </main>
  );
}

export default function BusinessAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 animate-spin border-t-gray-900" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-gray-100 animate-ping" />
        </div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}