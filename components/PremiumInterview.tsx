"use client";

import { useState, useEffect, useRef } from "react";
import InterviewHelp from "./InterviewHelp";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface PremiumInterviewProps {
  profession: string;
  specialization: string;
  userContext: {
    tasks: { task: string; priority: number }[];
    challenges: string[];
    experience: string;
  };
  onComplete: (sessionId: string) => void;
}

export default function PremiumInterview({
  profession,
  specialization,
  userContext,
  onComplete,
}: PremiumInterviewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [answerQuality, setAnswerQuality] = useState<"short" | "good" | "excellent">("good");
  const [showHelp, setShowHelp] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const totalQuestions = 12;

  useEffect(() => {
    startInterview();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/premium/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession, specialization, userContext }),
      });

      const data = await response.json();
      setSessionId(data.sessionId);
      setMessages([{ role: "assistant", content: data.firstQuestion }]);
      setCurrentQuestion(data.firstQuestion);
      setQuestionCount(1);
    } catch (error) {
      console.error("Error starting interview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isLoading) return;

    const userMessage = currentInput.trim();
    const wordCount = userMessage.split(' ').length;
    
    // Validera svar-längd (minst 20 tecken för kvalitativa svar)
    if (userMessage.length < 20) {
      alert("Vänligen ge ett mer utförligt svar (minst några ord). Ju mer kontext du ger, desto bättre blir din rapport!");
      return;
    }

    // Sätt kvalitetsindikator baserat på svar-längd
    if (wordCount < 10) {
      setAnswerQuality("short");
    } else if (wordCount < 30) {
      setAnswerQuality("good");
    } else {
      setAnswerQuality("excellent");
    }

    setCurrentInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/premium/interview/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userAnswer: userMessage,
          questionNumber: questionCount,
        }),
      });

      const data = await response.json();

      if (data.isComplete) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.finalMessage },
        ]);
        setIsComplete(true);
        setTimeout(() => onComplete(sessionId), 2000);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.nextQuestion },
        ]);
        setCurrentQuestion(data.nextQuestion);
        setQuestionCount(data.questionNumber);
      }
    } catch (error) {
      console.error("Error continuing interview:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ursäkta, något gick fel. Kan du försöka igen?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = Math.min((questionCount / totalQuestions) * 100, 100);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 lg:p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold">Premium Djupanalys</h2>
              <p className="text-sm lg:text-base text-gray-300 mt-1">
                {profession} • {specialization}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-3xl font-bold">{questionCount}/{totalQuestions}</div>
              <p className="text-xs text-gray-300">Frågor</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="p-6 lg:p-8 h-[50vh] lg:h-[60vh] overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-fade-in-up`}
            >
              <div
                className={`max-w-[85%] lg:max-w-[75%] p-4 rounded-2xl ${
                  message.role === "user"
                    ? "bg-gray-900 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                        AI
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        Mendio Analys
                      </span>
                    </div>
                    {index === messages.length - 1 && !isLoading && !isComplete && (
                      <button
                        onClick={() => setShowHelp(true)}
                        className="w-6 h-6 rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center text-sm"
                      >
                        ?
                      </button>
                    )}
                  </div>
                )}
                <p className="text-sm lg:text-base whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="max-w-[75%] p-4 rounded-2xl bg-gray-100 rounded-bl-none">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <span className="text-xs text-gray-500">Analyserar ditt svar...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 lg:p-6 bg-gray-50">
          {!isComplete ? (
            <>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Skriv ditt svar här..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-all text-sm lg:text-base"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading || !currentInput.trim()}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm lg:text-base"
                >
                  Skicka
                </button>
              </form>
              
              {/* Live feedback på svar-kvalitet */}
              <div className="mt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {currentInput.split(' ').length < 10 ? (
                    <span className="text-orange-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Försök ge mer detaljer för bästa resultat
                    </span>
                  ) : currentInput.split(' ').length < 30 ? (
                    <span className="text-blue-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Bra svar! Fler detaljer = bättre rapport
                    </span>
                  ) : (
                    <span className="text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Utmärkt! Såna här svar ger bäst rapport
                    </span>
                  )}
                </div>
                <span className="text-gray-400">
                  {currentInput.split(' ').filter(w => w.length > 0).length} ord
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-green-600 font-medium">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Intervju slutförd! Genererar din rapport...</span>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center mt-3">
            💡 Var så utförlig du kan – ju mer kontext, desto bättre rekommendationer
          </p>
        </div>
      </div>
      
      <InterviewHelp 
        question={currentQuestion}
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}

