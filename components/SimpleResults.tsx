"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import FeedbackButton from "@/components/FeedbackButton";
import { ChevronRight, ChevronDown, ChevronLeft, Copy, Check, Mail, Sparkles, Share2, Bot, Calendar } from "lucide-react";
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

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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

      const response = await fetch("/api/business/generate-solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession,
          specialization,
          tasks: topTasks,
          language: t('language.code')
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
        solution: `AI kan hjälpa dig automatisera och effektivisera denna uppgift. Med rätt verktyg och prompts kan du spara upp till 60% av tiden du lägger på ${t.task.toLowerCase()}.`,
        prompt: `**ROLL & KONTEXT:**
Jag är en professionell ${profession} som behöver hjälp med ${t.task.toLowerCase()}.

**UPPGIFT:**
Skapa en detaljerad steg-för-steg guide för att effektivisera denna uppgift med AI.

**INPUT - Fyll i detta:**
[BESKRIV DIN SITUATION]: 
[SPECIFIKA KRAV]: 

**OUTPUT-FORMAT:**
Konkret handlingsplan med tidsbesparingar.

**EXEMPEL:**
Visa mig ett praktiskt exempel på hur jag kan använda detta direkt.`
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
              <div className="relative">
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
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

              {/* Prompt */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Prova denna prompt:
                </h4>
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
              <div className="relative">
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
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