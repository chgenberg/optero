"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import { ChevronRight, ChevronLeft, Copy, Check, HelpCircle, X, Mail, Sparkles, Share2, Calendar } from "lucide-react";

interface Solution {
  task: string;
  solution: string;
  prompt: string;
}

export default function BusinessResults() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    const saved = sessionStorage.getItem("companyAnalysis");
    if (!saved) {
      router.push("/business/site-analyzer");
      return;
    }
    const parsedData = JSON.parse(saved);
    setData(parsedData);
    generatePrompts(parsedData);
  }, []);

  const generatePrompts = async (analysisData: any) => {
    if (!analysisData) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/business/generate-company-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: analysisData.url, 
          department: analysisData.dept, 
          content: analysisData.content 
        })
      });
      const res = await resp.json();
      setSolutions(res.solutions || []);
    } catch (error) {
      console.error("Failed to generate prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleNext = () => {
    if (currentStep < solutions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentStep < solutions.length) {
      handleNext();
    }
    if (isRightSwipe && currentStep > 0) {
      handlePrevious();
    }
  };

  if (loading) {
    return <LoadingAnalysis />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up px-4 py-8">
      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-fade-in-up">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Så här använder du prompten</h2>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Steps */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-700">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Öppna ChatGPT</h3>
                  <p className="text-gray-700">Gå till <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">chat.openai.com</a></p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-700">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Kopiera prompten</h3>
                  <p className="text-gray-700">Klicka på kopiera-knappen bredvid prompten.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-700">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fyll i dina uppgifter</h3>
                  <p className="text-gray-700">Klistra in prompten i ChatGPT. Ersätt alla <span className="bg-yellow-200 px-1 rounded">[gula markeringar]</span> med din egen information.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-700">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Skicka och få resultat</h3>
                  <p className="text-gray-700">Tryck Enter. ChatGPT genererar ett skräddarsytt svar baserat på ditt företag.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {currentStep < solutions.length ? (
        <>
          {/* Top navigation - desktop */}
          <div className="hidden sm:flex justify-between items-center mb-6">
            {currentStep > 0 ? (
              <button
                onClick={handlePrevious}
                className="group flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Tillbaka</span>
              </button>
            ) : (
              <div className="w-20" />
            )}
            
            <button
              onClick={handleNext}
              className="group flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-200"
            >
              <span className="text-sm font-medium">Nästa uppgift</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div 
            className="relative"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] transition-shadow duration-300">
              {/* Progress */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-xs sm:text-sm font-medium text-gray-500">
                  Prompt {currentStep + 1} av {solutions.length}
                </h2>
                <div className="flex gap-1">
                  {solutions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 w-6 sm:w-8 rounded-full transition-all duration-300 ${
                        idx <= currentStep ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Task */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {solutions[currentStep].task}
                </h3>
              </div>

              {/* Solution */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Lösning:
                </h4>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {solutions[currentStep].solution}
                </p>
              </div>

              {/* Prompt */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                    Prova denna prompt:
                  </h4>
                  <button
                    onClick={() => setShowHelpModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Så här gör du</span>
                  </button>
                </div>
                <div className="relative bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
                  <div className="pr-10 overflow-x-auto">
                    <pre 
                      className="text-gray-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono break-words"
                      dangerouslySetInnerHTML={{
                        __html: solutions[currentStep].prompt
                          .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900 font-bold">$1</strong>')
                          .replace(/\[([^\]]+)\]/g, '<strong class="bg-yellow-200 px-1 rounded text-gray-900">[$1]</strong>')
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleCopy(solutions[currentStep].prompt, currentStep)}
                    className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Kopiera prompt"
                  >
                    {copiedIndex === currentStep ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom navigation */}
          <div className="flex justify-between items-center mt-6">
            {currentStep > 0 ? (
              <button
                onClick={handlePrevious}
                className="group flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Tillbaka</span>
              </button>
            ) : (
              <div className="w-20" />
            )}
            
            <button
              onClick={handleNext}
              className="group flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-200"
            >
              <span className="text-sm font-medium">Nästa</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
          {/* Mobile swipe hint */}
          <p className="text-xs text-gray-500 text-center mt-4 sm:hidden">
            Svep för att navigera mellan uppgifter
          </p>
        </>
      ) : (
        // Choice card
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="flex justify-start mb-6">
            <button
              onClick={() => setCurrentStep(solutions.length - 1)}
              className="group flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Tillbaka till sista prompten</span>
            </button>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Vad vill du göra nu?
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Välj hur du vill fortsätta
            </p>
          </div>

          <div className="space-y-4">
            {/* Email option */}
            <button
              onClick={() => alert("Email-funktion kommer snart!")}
              className="w-full group/choice flex items-center justify-between p-5 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Få alla prompts via email</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Skicka alla prompts + implementationsguide</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover/choice:translate-x-1 transition-transform" />
            </button>

            {/* Share option */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `AI-lösningar för ${data?.dept}`,
                    text: `Kolla in dessa AI-lösningar för ${data?.dept}!`,
                    url: window.location.href,
                  });
                }
              }}
              className="w-full group/choice flex items-center justify-between p-5 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Dela med kollegor</h3>
                  <p className="text-sm text-gray-600">Hjälp dina kollegor spara tid också!</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover/choice:translate-x-1 transition-transform" />
            </button>

            {/* Consultation option */}
            <button
              onClick={() => window.open('mailto:ch.genberg@gmail.com?subject=Konsultation för ' + (data?.dept || 'företag'), '_blank')}
              className="w-full group/choice flex items-center justify-between p-5 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Boka 15-min konsultation</h3>
                  <p className="text-sm text-gray-600">Gratis genomgång med AI-expert</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover/choice:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Back to start */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/business/site-analyzer")}
              className="text-gray-600 hover:text-gray-900 text-sm underline underline-offset-4 transition-colors"
            >
              Analysera ett annat företag
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
