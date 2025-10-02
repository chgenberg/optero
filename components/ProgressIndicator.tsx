"use client";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-md mx-auto mt-4 mb-6 animate-fade-in">
      <div className="w-full bg-gray-100 rounded-full h-1">
        <div
          className="bg-gray-900 h-1 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">
        Steg {currentStep} av {totalSteps}
      </p>
    </div>
  );
}
