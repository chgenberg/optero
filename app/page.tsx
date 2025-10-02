"use client";

import { useState } from "react";
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
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Logo i övre vänstra hörnet */}
      {step === "profession" && (
        <div className="fixed top-4 left-4 sm:top-6 sm:left-6 lg:top-8 lg:left-8 z-50">
          <img 
            src="/Optero_logo.png" 
            alt="Optero" 
            className="h-8 sm:h-10 lg:h-12 object-contain"
          />
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Info button */}
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-50">
          <button
            onClick={() => setShowInfo(true)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Information"
          >
            <span className="text-lg sm:text-xl font-light">?</span>
          </button>
        </div>

        {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}

        {/* Progress indicator */}
        {step !== "profession" && step !== "results" && (
          <ProgressIndicator 
            currentStep={STEP_NUMBER[step]} 
            totalSteps={3} 
          />
        )}

      {step === "profession" && (
        <div className="space-y-8">
          <ProfessionInput onSelect={handleProfessionSelect} />
          
          {/* Demo button */}
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-gray-500 mb-3">eller</p>
            <a
              href="/demo/ekonomiassistent"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-all duration-200 group"
            >
              <span className="text-sm font-medium">Se exempel för Ekonomiassistent</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
          </div>
        </div>
      )}

      {step === "specialization" && (
        <SpecializationInput
          profession={profession}
          onSelect={handleSpecializationSelect}
          onBack={() => setStep("profession")}
        />
      )}

      {step === "tasks" && (
        <TaskSelection
          profession={profession}
          specialization={specialization}
          onSubmit={handleTasksSubmit}
          onBack={() => setStep("specialization")}
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

