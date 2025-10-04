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

export type Step = "profession" | "specialization" | "tasks" | "results";

const STEP_NUMBER: Record<Step, number> = {
  profession: 1,
  specialization: 2,
  tasks: 3,
  results: 4
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
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              AI för ditt yrke
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 font-light">
              Hitta rätt verktyg, spara tid varje dag
            </p>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <ProfessionInput onSelect={handleProfessionSelect} />
          </div>
          
          {/* Quick actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <a
              href="/demo/ekonomiassistent"
              className="btn-secondary group"
            >
              <span>Se demo</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/prompts"
              className="btn-ghost group"
            >
              <span>Upptäck prompts</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
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