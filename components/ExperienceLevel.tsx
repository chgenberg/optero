"use client";

import { useState } from "react";

interface ExperienceLevelProps {
  onSelect: (level: string) => void;
  onBack: () => void;
}

const EXPERIENCE_LEVELS = [
  {
    level: "Nybörjare",
    description: "0-2 år inom yrket"
  },
  {
    level: "Erfaren",
    description: "3-7 år inom yrket"
  },
  {
    level: "Senior/Expert",
    description: "8+ år inom yrket"
  }
];

export default function ExperienceLevel({ onSelect, onBack }: ExperienceLevelProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (level: string) => {
    setSelected(level);
    setTimeout(() => onSelect(level), 300);
  };

  return (
    <div className="w-full max-w-2xl animate-fade-in-up">
      <div className="relative bg-white rounded-3xl shadow-xl p-12 border border-gray-100 overflow-hidden">
        <div className="absolute inset-0 gradient-radial pointer-events-none" />
        <button
          onClick={onBack}
          className="mb-6 text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-2"
        >
          ← Tillbaka
        </button>

        <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
          Hur erfaren är du?
        </h2>
        <p className="text-center text-gray-500 mb-8 font-light">
          Detta hjälper oss att rekommendera verktyg på rätt nivå
        </p>

        <div className="space-y-4">
          {EXPERIENCE_LEVELS.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelect(item.level)}
              className={`w-full p-6 rounded-2xl text-left transition-all duration-200 border-2 ${
                selected === item.level
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold mb-1">{item.level}</h3>
                <p className={`text-sm ${selected === item.level ? "text-gray-300" : "text-gray-600"}`}>
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

