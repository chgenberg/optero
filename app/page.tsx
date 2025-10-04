"use client";

import { useState, useEffect } from "react";
import ProfessionInput from "@/components/ProfessionInput";
import SpecializationInput from "@/components/SpecializationInput";
import ExperienceLevel from "@/components/ExperienceLevel";
import ChallengesInput from "@/components/ChallengesInput";
import TaskSelection from "@/components/TaskSelection";
import AIRecommendations from "@/components/AIRecommendations";
import InfoPopup from "@/components/InfoPopup";
import ProgressIndicator from "@/components/ProgressIndicator";
import EmailCapture from "@/components/EmailCapture";
import OnboardingTutorial from "@/components/OnboardingTutorial";

export type Step = "profession" | "specialization" | "tasks" | "email" | "results";

const STEP_NUMBER: Record<Step, number> = {
  profession: 1,
  specialization: 2,
  tasks: 3,
  email: 4,
  results: 5
};

export default function Home() {
  const [step, setStep] = useState<Step>("profession");
  const [profession, setProfession] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [challenges, setChallenges] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<{task: string, priority: number}[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Save session data whenever step or data changes
  useEffect(() => {
    if (profession) {
      saveSession();
    }
  }, [step, profession, specialization, selectedTasks]);

  const saveSession = async () => {
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          profession,
          specialization,
          experience,
          selectedTasks,
          challenges,
          completedSteps: STEP_NUMBER[step],
        }),
      });

      const data = await response.json();
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  };

  const handleProfessionSelect = (prof: string) => {
    setProfession(prof);
    setStep("specialization");
  };

  const handleSpecializationSelect = (spec: string) => {
    setSpecialization(spec);
    setStep("tasks");
  };

  const handleTasksSubmit = (tasks: {task: string, priority: number}[]) => {
    setSelectedTasks(tasks);
    setStep("email");
  };

  const [userEmail, setUserEmail] = useState("");
  const [userConsent, setUserConsent] = useState(false);

  const handleEmailSubmit = (email: string, consent: boolean) => {
    setUserEmail(email);
    setUserConsent(consent);
    setStep("results");
  };

  const handleReset = () => {
    setStep("profession");
    setProfession("");
    setSpecialization("");
    setExperience("");
    setChallenges([]);
    setSelectedTasks([]);
    setSessionId(null);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}
      
      {/* Onboarding tutorial for first-time users */}
      {step === "profession" && <OnboardingTutorial />}

        {/* Minimal Progress indicator */}
        {step !== "profession" && step !== "results" && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      num <= STEP_NUMBER[step]
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {num}
                  </div>
                  {num < 3 && (
                    <div
                      className={`w-12 h-0.5 transition-all duration-300 ${
                        num < STEP_NUMBER[step] ? "bg-gray-900" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {step === "profession" && (
        <div className="space-y-12 max-w-2xl mx-auto w-full">
          {/* Hero section */}
          <div className="text-center animate-fade-in-up">
            {/* Social proof badge */}
            <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-6 animate-pulse-scale">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-700 font-medium">1,247 yrkesverksamma sparar redan 8+ timmar/vecka</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight uppercase leading-tight">
              AI SOM FÖRLÄNGER DIN TID
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-3 sm:mb-4 px-4 sm:px-0">
              Gör jobbet enklare, så du får mer tid till det som betyder mest.
            </p>
            <p className="text-lg text-gray-600 flex items-center justify-center gap-2">
              <span className="text-2xl">🔍</span>
              <span>Sök efter ditt yrke och upptäck hur AI kan hjälpa dig.</span>
            </p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Resultat på under 2 minuter
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                100% GDPR-säkert
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Ingen kreditkort krävs
              </span>
            </div>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <ProfessionInput onSelect={handleProfessionSelect} />
            
            {/* Subtle demo link below input */}
            <div className="text-center mt-6">
              <a
                href="/demo/ekonomiassistent"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-full transition-all group text-sm font-medium"
              >
                <span>Se hur det funkar</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {step === "specialization" && (
        <div className="space-y-6 max-w-2xl mx-auto w-full animate-fade-in-up">
          <button
            onClick={() => setStep("profession")}
            className="btn-ghost mb-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tillbaka
          </button>
          
          <SpecializationInput
            profession={profession}
            onSelect={handleSpecializationSelect}
            onBack={() => setStep("profession")}
          />
        </div>
      )}

      {step === "tasks" && (
        <div className="max-w-2xl mx-auto w-full animate-fade-in-up">
          <button
            onClick={() => setStep("specialization")}
            className="btn-ghost mb-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tillbaka
          </button>
          
          <TaskSelection
            profession={profession}
            specialization={specialization}
            onSubmit={handleTasksSubmit}
            onBack={() => setStep("specialization")}
          />
        </div>
      )}

      {step === "email" && (
        <EmailCapture
          profession={profession}
          specialization={specialization}
          onSubmit={handleEmailSubmit}
        />
      )}

      {step === "results" && (
        <AIRecommendations
          profession={profession}
          specialization={specialization}
          experience={experience}
          challenges={challenges}
          tasks={selectedTasks}
          onReset={handleReset}
        />
      )}
      </div>
    </main>
  );
}