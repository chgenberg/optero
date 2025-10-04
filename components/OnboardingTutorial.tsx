"use client";

import { useState, useEffect } from "react";

export default function OnboardingTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setTimeout(() => setShowTutorial(true), 500);
    }
  }, []);

  const steps = [
    {
      title: "Välkommen till Optero! 👋",
      content: "Låt oss hjälpa dig hitta AI-verktyg som passar just ditt yrke.",
      position: "center",
    },
    {
      title: "Steg 1: Ange ditt yrke",
      content: "Börja med att skriva in vad du jobbar med. Vi har stöd för över 100 olika yrken!",
      position: "profession-input",
    },
    {
      title: "Steg 2: Välj specialisering",
      content: "Berätta mer om din specifika roll så kan vi ge ännu bättre rekommendationer.",
      position: "center",
    },
    {
      title: "Steg 3: Välj arbetsuppgifter",
      content: "Markera vilka uppgifter du vill få hjälp med och hur viktiga de är.",
      position: "center",
    },
    {
      title: "Klart! 🎉",
      content: "Du får personliga AI-rekommendationer som kan spara dig 5-15 timmar per vecka.",
      position: "center",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handleSkip = () => {
    completeTutorial();
  };

  const completeTutorial = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setShowTutorial(false);
  };

  if (!showTutorial) return null;

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" />

      {/* Tutorial card */}
      <div className={`fixed z-50 ${
        currentStepData.position === "center" 
          ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          : "top-40 left-1/2 -translate-x-1/2"
      }`}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md animate-scale-in">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? "w-8 bg-gray-900" 
                    : index < currentStep 
                    ? "bg-gray-600" 
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 text-center mb-8">
            {currentStepData.content}
          </p>

          {/* Buttons */}
          <div className="flex gap-4">
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="flex-1 btn-secondary"
              >
                Hoppa över
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 btn-primary"
            >
              {currentStep < steps.length - 1 ? "Nästa" : "Börja nu"}
            </button>
          </div>

          {/* Step indicator */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Steg {currentStep + 1} av {steps.length}
          </p>
        </div>
      </div>

      {/* Spotlight effect (optional) */}
      {currentStepData.position === "profession-input" && (
        <div 
          className="fixed top-32 left-1/2 -translate-x-1/2 w-96 h-32 rounded-2xl ring-4 ring-white ring-offset-8 ring-offset-black/50 z-40 pointer-events-none animate-pulse"
        />
      )}
    </>
  );
}
