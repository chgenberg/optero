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
import { useLanguage } from "@/contexts/LanguageContext";

export type Step = "profession" | "specialization" | "tasks" | "email" | "loading" | "results";

const STEP_NUMBER: Record<Step, number> = {
  profession: 1,
  specialization: 2,
  tasks: 3,
  email: 4,
  loading: 5,
  results: 5
};

export default function Home() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("profession");
  const [profession, setProfession] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [challenges, setChallenges] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<{task: string, priority: number}[]>([]);

  // Check if user is returning from purchase page
  useEffect(() => {
    const lastResults = sessionStorage.getItem("lastResults");
    if (lastResults) {
      try {
        const data = JSON.parse(lastResults);
        // If results are less than 1 hour old, restore them
        if (Date.now() - data.timestamp < 3600000) {
          setProfession(data.profession);
          setSpecialization(data.specialization);
          setExperience(data.experience);
          setChallenges(data.challenges);
          setSelectedTasks(data.tasks);
          setStep("results");
        }
      } catch (e) {
        console.error("Failed to restore results:", e);
      }
    }
  }, []);
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
    setStep("loading");
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
      <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-20 sm:pt-24">
        {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}
      

        {/* Minimal Progress indicator */}
        {step !== "profession" && step !== "results" && (
          <div className="max-w-2xl mx-auto mb-8 pt-4">
            <div className="flex items-center gap-2 justify-center">
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
          {/* Hero section with interactive border */}
          <div className="relative group">
            {/* Animated border container */}
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl opacity-75 group-hover:opacity-100 blur-sm transition duration-1000 group-hover:duration-200 animate-gradient-x overflow-hidden"></div>
            
            {/* Content */}
            <div className="relative bg-white rounded-2xl p-8 sm:p-12">
              <div className="text-center animate-fade-in-up">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-wider uppercase">
                  {t('hero.title')}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light px-4 sm:px-0 tracking-wide">
                  {t('hero.subtitle')}
                </p>
              </div>
              
              <div className="mt-12">
                <ProfessionInput onSelect={handleProfessionSelect} />
                
                {/* Subtle links below input */}
                <div className="text-center mt-6">
                  <a
                    href="/demo/ekonomiassistent"
                    className="text-gray-500 hover:text-gray-900 transition-colors text-sm underline-offset-4 hover:underline"
                  >
                    {t('hero.demoLink')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "specialization" && (
        <div className="space-y-6 max-w-2xl mx-auto w-full animate-fade-in-up">
          <SpecializationInput
            profession={profession}
            onSelect={handleSpecializationSelect}
            onBack={() => setStep("profession")}
          />
        </div>
      )}

      {step === "tasks" && (
        <div className="max-w-2xl mx-auto w-full animate-fade-in-up">
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

      {step === "loading" && (
        <div className="w-full animate-fade-in-up">
          <AIRecommendations
            profession={profession}
            specialization={specialization}
            experience={experience}
            challenges={challenges}
            tasks={selectedTasks}
            onReset={handleReset}
            onDataLoaded={() => setStep("results")}
            showLoadingState={true}
          />
        </div>
      )}

      {step === "results" && (
        <AIRecommendations
          profession={profession}
          specialization={specialization}
          experience={experience}
          challenges={challenges}
          tasks={selectedTasks}
          onReset={handleReset}
          showLoadingState={false}
        />
      )}
      </div>
    </main>
  );
}