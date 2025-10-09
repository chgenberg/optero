"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import { ChevronRight, ChevronLeft, Copy, Check, HelpCircle, X, Mail, Sparkles, Share2, Calendar, Bot, ExternalLink } from "lucide-react";

interface Solution {
  task: string;
  solution: string;
  prompt: string;
  recommendedTool?: string;
}

export default function BusinessResults() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showToolGuide, setShowToolGuide] = useState<string | null>(null);
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

  const toolGuides = {
    "ChatGPT 4": {
      name: "ChatGPT 4",
      icon: "🤖",
      color: "bg-green-100 text-green-700",
      url: "https://chat.openai.com",
      steps: [
        "Gå till chat.openai.com",
        "Logga in eller skapa konto (ChatGPT Plus krävs för GPT-4)",
        "Välj 'GPT-4' i dropdown-menyn högst upp",
        "Klistra in prompten och tryck Enter"
      ],
      pros: "Bäst för komplexa uppgifter, kreativt skrivande, kodning",
      cost: "Plus: $20/mån"
    },
    "Claude 3": {
      name: "Claude 3",
      icon: "🧠",
      color: "bg-purple-100 text-purple-700",
      url: "https://claude.ai",
      steps: [
        "Gå till claude.ai",
        "Skapa konto med email",
        "Starta ny konversation",
        "Klistra in prompten och tryck Enter"
      ],
      pros: "Utmärkt för långa dokument, analys, forskningsuppgifter",
      cost: "Gratis (begränsad) eller Pro: $20/mån"
    },
    "Gemini Pro": {
      name: "Gemini Pro",
      icon: "💎",
      color: "bg-blue-100 text-blue-700",
      url: "https://gemini.google.com",
      steps: [
        "Gå till gemini.google.com",
        "Logga in med Google-konto",
        "Välj 'Gemini Pro' om tillgängligt",
        "Klistra in prompten och tryck Enter"
      ],
      pros: "Integrerad med Google-tjänster, bra för faktasökning",
      cost: "Gratis eller Advanced: $19.99/mån"
    },
    "Perplexity": {
      name: "Perplexity",
      icon: "🔍",
      color: "bg-amber-100 text-amber-700",
      url: "https://perplexity.ai",
      steps: [
        "Gå till perplexity.ai",
        "Använd direkt (inget konto krävs)",
        "Välj 'Pro' för bästa resultat",
        "Klistra in prompten och tryck Enter"
      ],
      pros: "Bäst för research med källor, realtidsdata",
      cost: "Gratis eller Pro: $20/mån"
    }
  };

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

      {/* Tool Guide Modal */}
      {showToolGuide && toolGuides[showToolGuide as keyof typeof toolGuides] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-fade-in-up">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${toolGuides[showToolGuide as keyof typeof toolGuides].color}`}>
                    {toolGuides[showToolGuide as keyof typeof toolGuides].icon}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Så använder du {toolGuides[showToolGuide as keyof typeof toolGuides].name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {toolGuides[showToolGuide as keyof typeof toolGuides].pros}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowToolGuide(null)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {/* Steps */}
              <div className="space-y-4">
                {toolGuides[showToolGuide as keyof typeof toolGuides].steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-gray-700">{idx + 1}</span>
                    </div>
                    <p className="text-gray-700 pt-2">{step}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="border-t pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={toolGuides[showToolGuide as keyof typeof toolGuides].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span>Öppna {toolGuides[showToolGuide as keyof typeof toolGuides].name}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <div className="text-center text-sm text-gray-600">
                    <p>Kostnad: {toolGuides[showToolGuide as keyof typeof toolGuides].cost}</p>
                  </div>
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
                className="group flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-all duration-200 rounded-lg hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="font-medium">Tillbaka</span>
              </button>
            ) : (
              <div className="w-20" />
            )}
            
            <button
              onClick={handleNext}
              className="group relative flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              <span className="relative z-10 text-sm font-semibold">Nästa uppgift</span>
              <ChevronRight className="relative z-10 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>

          <div 
            className="relative"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_64px_rgba(0,0,0,0.16)] transition-all duration-500 border border-gray-100 hover:border-gray-200">
              {/* Progress */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Prompt {currentStep + 1} av {solutions.length}
                </h2>
                <div className="flex gap-1.5">
                  {solutions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 w-6 sm:w-8 rounded-full transition-all duration-500 ${
                        idx === currentStep
                          ? 'bg-gradient-to-r from-gray-800 to-gray-900 scale-110'
                          : idx < currentStep
                          ? 'bg-gray-600'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Task */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-gray-800 to-gray-600 rounded-full flex-shrink-0"></div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                    {solutions[currentStep].task}
                  </h3>
                </div>
              </div>

              {/* Solution */}
              <div className="mb-6 sm:mb-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 sm:p-6 border border-gray-200/50">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gray-600" />
                  Lösning
                </h4>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {solutions[currentStep].solution}
                </p>
              </div>

              {/* Recommended Tool */}
              {solutions[currentStep].recommendedTool && (
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Rekommenderat verktyg:</span>
                      <span className="text-sm font-bold text-gray-900">
                        {solutions[currentStep].recommendedTool}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowToolGuide(solutions[currentStep].recommendedTool || null)}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Hur använder jag detta?
                    </button>
                  </div>
                </div>
              )}

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
                    <span>Allmän guide</span>
                  </button>
                </div>
                <div className="relative bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100/30 rounded-xl p-4 sm:p-5 border border-gray-200 shadow-inner">
                  <div className="pr-12 overflow-x-auto">
                    <pre 
                      className="text-gray-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono break-words"
                      dangerouslySetInnerHTML={{
                        __html: solutions[currentStep].prompt
                          .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900 font-bold">$1</strong>')
                          .replace(/\[([^\]]+)\]/g, '<mark class="bg-yellow-200 px-1.5 py-0.5 rounded text-gray-900 font-semibold shadow-sm">[$1]</mark>')
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleCopy(solutions[currentStep].prompt, currentStep)}
                    className="absolute top-4 right-4 p-2 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
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
                className="group flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-all duration-200 rounded-lg hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline font-medium">Tillbaka</span>
              </button>
            ) : (
              <div className="w-20" />
            )}
            
            <button
              onClick={handleNext}
              className="group relative flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              <span className="relative z-10 text-sm font-semibold">Nästa</span>
              <ChevronRight className="relative z-10 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
          
          {/* Mobile swipe hint */}
          <p className="text-xs text-gray-500 text-center mt-4 sm:hidden">
            Svep för att navigera mellan uppgifter
          </p>
        </>
      ) : (
        // Choice card
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-gray-100">
          <div className="flex justify-start mb-8">
            <button
              onClick={() => setCurrentStep(solutions.length - 1)}
              className="group flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-all duration-200 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-medium">Tillbaka till sista prompten</span>
            </button>
          </div>
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-gray-700" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Vad vill du göra nu?
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Välj hur du vill fortsätta med dina AI-prompts
            </p>
          </div>

          <div className="space-y-4">
            {/* Email option */}
            <button
              onClick={() => alert("Email-funktion kommer snart!")}
              className="w-full group/choice relative flex items-center justify-between p-5 bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0 group-hover/choice:scale-110 transition-transform duration-300">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">Få alla prompts via email</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Skicka alla prompts + implementationsguide</p>
                </div>
              </div>
              <ChevronRight className="relative z-10 w-6 h-6 text-gray-400 group-hover/choice:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-blue-50/0 translate-x-[-100%] group-hover/choice:translate-x-[100%] transition-transform duration-1000"></div>
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
              className="w-full group/choice relative flex items-center justify-between p-5 bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center flex-shrink-0 group-hover/choice:scale-110 transition-transform duration-300">
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">Dela med kollegor</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Hjälp dina kollegor spara tid också!</p>
                </div>
              </div>
              <ChevronRight className="relative z-10 w-6 h-6 text-gray-400 group-hover/choice:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50/0 via-orange-50/50 to-orange-50/0 translate-x-[-100%] group-hover/choice:translate-x-[100%] transition-transform duration-1000"></div>
            </button>

            {/* Consultation option */}
            <button
              onClick={() => window.open('mailto:ch.genberg@gmail.com?subject=Konsultation för ' + (data?.dept || 'företag'), '_blank')}
              className="w-full group/choice relative flex items-center justify-between p-5 bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center flex-shrink-0 group-hover/choice:scale-110 transition-transform duration-300">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-700" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">Boka 15-min konsultation</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Gratis genomgång med AI-expert</p>
                </div>
              </div>
              <ChevronRight className="relative z-10 w-6 h-6 text-gray-400 group-hover/choice:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-indigo-50/50 to-indigo-50/0 translate-x-[-100%] group-hover/choice:translate-x-[100%] transition-transform duration-1000"></div>
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
