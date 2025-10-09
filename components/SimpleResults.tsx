"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import FeedbackButton from "@/components/FeedbackButton";
import { ChevronRight, ChevronDown, ChevronLeft, Copy, Check, Mail, Sparkles, Share2, Bot, Calendar, HelpCircle, X, ExternalLink } from "lucide-react";
import EmailCaptureModal from "./EmailCaptureModal";
import LoadingAnalysis from "./LoadingAnalysis";

interface Task {
  task: string;
  priority: number;
}

interface TaskSolution {
  task: string;
  solution: string;
  prompt: string;
  recommendedTool?: string;
}

interface SimpleResultsProps {
  profession: string;
  specialization: string;
  tasks: Task[];
  onReset: () => void;
}

export default function SimpleResults({
  profession,
  specialization,
  tasks,
  onReset,
}: SimpleResultsProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [solutions, setSolutions] = useState<TaskSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showToolGuide, setShowToolGuide] = useState<string | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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

  useEffect(() => {
    generateSolutions();
  }, []);

  const generateSolutions = async () => {
    try {
      setLoading(true);
      
      // Get top 3 tasks (highest priority)
      const topTasks = tasks
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 3)
        .map(t => t.task);

      // Read optional context
      let context: any = {};
      try {
        context = JSON.parse(sessionStorage.getItem("analysisContext") || "{}");
      } catch {}

      const response = await fetch("/api/business/generate-solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession,
          specialization,
          tasks: topTasks,
          language: t('language.code'),
          context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", response.status, errorData);
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      
      // Validate that we got solutions array
      if (!data.solutions || !Array.isArray(data.solutions) || data.solutions.length === 0) {
        console.error("Invalid data structure:", data);
        throw new Error("Invalid solutions data received");
      }
      
      setSolutions(data.solutions);
    } catch (error) {
      console.error("Error generating solutions:", error);
      // Better fallback solutions with structure
      setSolutions(tasks.slice(0, 3).map(t => ({
        task: t.task,
        solution: `AI kan hjälpa dig automatisera och effektivisera denna uppgift. Här får du en färdig plan och ett konkret exempel utan att du behöver fylla i mycket själv.`,
        prompt: `**ROLL & KONTEXT:**
Du är expert på ${profession.toLowerCase()} och ska effektivisera: ${t.task.toLowerCase()}.

**UPPGIFT:**
Leverera en färdig, praktisk lösning som kan köras direkt (utan följdfrågor), samt ett ifyllt exempel.

**INPUT – Fyll i endast vid behov (max 3):**
Bransch/område: [ange vid behov]
System/verktyg: [t.ex. Excel, Google Drive, Fortnox]
Outputmål: [t.ex. Excel-fil, JSON, e‑postutkast]

**OUTPUT-FORMAT:**
1) Steg‑för‑steg (3–7 steg) med konkreta klick/kommandon
2) Minimal verktygslista (exakta länkar/menyval om relevant)
3) Testdata och valideringslista
4) Tidsbesparing (uppskattning) och eventuella risker

**FÄRDIGT EXEMPEL (ifyllt):**
Scenario: Mindre bolag tar emot PDF‑fakturor via e‑post, vill exportera: datum, belopp, moms, leverantör till Excel.
Verktyg: Google Drive + Make.com + Google Sheets
Plan: 1) Skapa e‑posttrigger i Make, 2) Spara PDF i Drive, 3) OCR med PDF.co, 4) Extrahera fält via RegEx‑mall, 5) Lägg rad i Google Sheet, 6) Markera dubbletter, 7) Skicka e‑postsammanfattning.
Testdata: /fakturor/2025‑09‑ACME‑1234.pdf
Validering: Belopp > 0, moms i {6%,12%,25%}, datum ISO‑8601.

Returnera svaret i ovan format, även om inga inputfält fylls i. Anta rimliga standarder om något saknas.`
      })));
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

  // Touch handlers for swipe
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

  const handleChoice = (choice: string) => {
    switch (choice) {
      case 'email':
        setShowEmailModal(true);
        break;
      case 'premium':
        router.push('/business/checkout');
        break;
      case 'tools':
        // Could navigate to tools page or show tools modal
        alert("AI-verktyg kommer snart!");
        break;
      case 'share':
        // Share functionality
        if (navigator.share) {
          navigator.share({
            title: `AI-lösningar för ${profession}`,
            text: `Kolla in dessa AI-lösningar för ${profession}!`,
            url: window.location.href,
          });
        }
        break;
      case 'consultation':
        alert("Konsultationbokning kommer snart!");
        break;
    }
  };

  if (loading) {
    return <LoadingAnalysis />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <FeedbackButton />
      
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        profession={profession}
        solutions={solutions}
      />
      
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
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-700">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Öppna ChatGPT</h3>
                  <p className="text-gray-700">Gå till <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">chat.openai.com</a> och logga in med ditt konto (eller skapa ett gratis konto om du inte har ett).</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-700">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Kopiera prompten</h3>
                  <p className="text-gray-700">Klicka på kopiera-ikonen (📋) bredvid prompten för att kopiera hela texten till ditt urklipp.</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-700">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fyll i dina uppgifter</h3>
                  <p className="text-gray-700">Klistra in prompten i ChatGPT. Ersätt alla gula markeringar <span className="bg-yellow-200 px-1 rounded">[som denna]</span> med din egen information. Till exempel:</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• <span className="bg-yellow-200 px-1 rounded">[ditt företag]</span> → "Café Solsken"</li>
                    <li>• <span className="bg-yellow-200 px-1 rounded">[målgrupp]</span> → "småbarnsföräldrar i Stockholm"</li>
                    <li>• <span className="bg-yellow-200 px-1 rounded">[budget]</span> → "5000 kr per månad"</li>
                  </ul>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-700">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Skicka och få resultat</h3>
                  <p className="text-gray-700">Tryck Enter för att skicka prompten. ChatGPT kommer nu generera ett skräddarsytt svar baserat på dina specifika behov.</p>
                </div>
              </div>
              
              {/* Tips */}
              <div className="bg-blue-50 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Pro-tips
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Var så specifik som möjligt när du fyller i platshållarna</li>
                  <li>• Du kan alltid be ChatGPT att justera eller förbättra svaret</li>
                  <li>• Spara bra prompts för framtida användning</li>
                  <li>• Experimentera med olika värden för att se vad som fungerar bäst</li>
                </ul>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-4 sm:p-6">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Förstått, stäng guiden
              </button>
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
          {/* Task cards (steps 1-3) */}
          {/* Top navigation - desktop only */}
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
              {/* Progress indicator */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-xs sm:text-sm font-medium text-gray-500">
                  Arbetsuppgift {currentStep + 1} av {solutions.length}
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
          
          {/* Bottom navigation - both desktop and mobile */}
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
        // Choice card (step 4)
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          {/* Back button at top of choice card */}
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
              Välj hur du vill fortsätta din AI-resa
            </p>
          </div>

          <div className="space-y-4">
            {/* Email option */}
            <button
              onClick={() => handleChoice('email')}
              className="w-full group/choice flex items-center justify-between p-5 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Få alla prompts via email</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Skicka 10-15 prompts + implementationsguide</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover/choice:translate-x-1 transition-transform" />
            </button>

            {/* Premium option */}
            <button
              onClick={() => handleChoice('premium')}
              className="w-full group/choice flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-300"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Köp fullständig analys</h3>
                  <p className="text-xs sm:text-sm text-gray-600">8-12 sidor + 20 prompts + 30 dagars support</p>
                  <p className="text-xs font-semibold text-purple-700 mt-1">299 kr</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-purple-400 group-hover/choice:translate-x-1 transition-transform" />
            </button>

            {/* Tools option */}
            <button
              onClick={() => handleChoice('tools')}
              className="w-full group/choice flex items-center justify-between p-5 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Se AI-verktyg för dessa uppgifter</h3>
                  <p className="text-sm text-gray-600">Upptäck verktyg som passar dina behov</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover/choice:translate-x-1 transition-transform" />
            </button>

            {/* Share option */}
            <button
              onClick={() => handleChoice('share')}
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
              onClick={() => handleChoice('consultation')}
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
              onClick={onReset}
              className="text-gray-600 hover:text-gray-900 text-sm underline underline-offset-4 transition-colors"
            >
              Börja om med nytt yrke
            </button>
          </div>
        </div>
      )}
    </div>
  );
}