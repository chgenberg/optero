"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InterviewHelp from "@/components/InterviewHelp";

interface Question {
  id: string;
  question: string;
  type: "text" | "multiselect" | "scale";
  options?: string[];
  followUp?: string;
}

interface Category {
  name: string;
  questions: Question[];
}

function PremiumInterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Check if coming from Stripe success
    const sessionId = searchParams?.get("session_id");
    if (sessionId) {
      setShowSuccessMessage(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }

    // Load prepared questions from session storage
    const questionsData = sessionStorage.getItem("premiumQuestions");
    const contextData = sessionStorage.getItem("premiumContext");
    
    if (questionsData) {
      const parsed = JSON.parse(questionsData);
      setCategories(parsed.categories || []);
      setLoading(false);
    } else {
      // If no questions, redirect back
      router.push("/");
    }
  }, []);

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestion = currentCategory?.questions[currentQuestionIndex];
  const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleNext = () => {
    if (!currentQuestion) return;

    // Save answer
    const answer = currentQuestion.type === "multiselect" ? selectedOptions : currentAnswer;
    setAnswers({ ...answers, [currentQuestion.id]: answer });

    // Reset answer fields
    setCurrentAnswer("");
    setSelectedOptions([]);

    // Move to next question
    if (currentQuestionIndex < currentCategory.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // All questions answered, proceed to payment
      proceedToPayment();
    }
  };

  const proceedToPayment = () => {
    // Save answers
    sessionStorage.setItem("premiumAnswers", JSON.stringify(answers));
    
    // In real app, this would go to Stripe checkout
    // For now, simulate payment success and go to results
    router.push("/premium/results");
  };

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-gray-600">Förbereder dina frågor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success message */}
      {showSuccessMessage && (
        <div className="fixed top-16 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-slide-up z-50">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-green-800">Betalning genomförd!</p>
              <p className="text-sm text-green-600">Nu skapar vi din personliga AI-guide</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gray-900 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-20">
        {/* Category header */}
        <div className="text-center mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            {currentCategory?.name}
          </h2>
          <p className="text-sm text-gray-400">
            Fråga {answeredQuestions + 1} av {totalQuestions}
          </p>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-medium text-gray-900 flex-1">
              {currentQuestion?.question}
            </h3>
            <button
              onClick={() => setShowHelp(true)}
              className="ml-4 w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center text-lg font-medium flex-shrink-0"
            >
              ?
            </button>
          </div>

          {/* Answer input based on type */}
          {currentQuestion?.type === "text" && (
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Beskriv så detaljerat som möjligt..."
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-300 focus:outline-none transition-all duration-200 min-h-[120px] resize-none"
              autoFocus
            />
          )}

          {currentQuestion?.type === "multiselect" && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedOptions.includes(option)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {selectedOptions.includes(option) && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.type === "scale" && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => setCurrentAnswer(option)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    currentAnswer === option
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Avbryt
          </button>

          <button
            onClick={handleNext}
            disabled={
              !currentAnswer && 
              currentQuestion?.type !== "multiselect" || 
              (currentQuestion?.type === "multiselect" && selectedOptions.length === 0)
            }
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {answeredQuestions === totalQuestions - 1 ? "Gå till betalning" : "Nästa fråga"}
          </button>
        </div>

        {/* Trust message */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Dina svar används endast för att skapa din personliga AI-guide och sparas inte.
        </p>
      </div>
      
      <InterviewHelp 
        question={currentQuestion?.question || ""}
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}

export default function PremiumInterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
      </div>
    }>
      <PremiumInterviewContent />
    </Suspense>
  );
}