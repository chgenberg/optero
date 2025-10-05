"use client";

import { useState, useEffect } from "react";

interface ChallengesInputProps {
  profession: string;
  specialization: string;
  onSubmit: (challenges: string[]) => void;
  onBack: () => void;
}

const COMMON_CHALLENGES: Record<string, string[]> = {
  "Vård och omsorg": [
    "För lite tid per patient",
    "Omfattande dokumentation",
    "Svårt att hålla sig uppdaterad med forskning",
    "Kommunikation mellan kollegor",
    "Stress och arbetsbelastning",
    "Repetitiva administrativa uppgifter"
  ],
  "default": [
    "Tidsbrist för viktiga uppgifter",
    "För mycket administration",
    "Svårt att hålla sig uppdaterad",
    "Ineffektiv kommunikation",
    "Repetitiva arbetsuppgifter",
    "Informationsöverflöd"
  ]
};

export default function ChallengesInput({
  profession,
  specialization,
  onSubmit,
  onBack,
}: ChallengesInputProps) {
  const [challenges, setChallenges] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Här kan vi göra mer sofistikerad logik senare baserat på yrke
    const challengesList = COMMON_CHALLENGES["Vård och omsorg"] || COMMON_CHALLENGES.default;
    setChallenges(challengesList);
  }, [profession, specialization]);

  const toggleChallenge = (challenge: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(challenge)
        ? prev.filter((c) => c !== challenge)
        : [...prev, challenge]
    );
  };

  const handleSubmit = () => {
    if (selectedChallenges.length > 0) {
      onSubmit(selectedChallenges);
    }
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

        <div className="relative">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Vilka är dina största utmaningar?
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="ml-2 inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-lg">?</span>
            </button>
          </h2>
        </div>
        
        {showHelp && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Tips för bra svar:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Välj 2-4 utmaningar för bäst resultat</li>
              <li>Tänk på vad som tar mest tid i din vardag</li>
              <li>Överväg både administrativa och kreativa uppgifter</li>
              <li>AI kan hjälpa med mer än du tror!</li>
            </ul>
          </div>
        )}
        
        <p className="text-center text-gray-500 mb-8 font-light">
          Välj de områden där du behöver mest hjälp (välj minst 1)
        </p>

        <div className="space-y-3 mb-8">
          {challenges.map((challenge, index) => (
            <button
              key={index}
              onClick={() => toggleChallenge(challenge)}
              className={`w-full p-4 rounded-2xl text-left transition-all duration-200 border-2 ${
                selectedChallenges.includes(challenge)
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedChallenges.includes(challenge)
                      ? "bg-white border-white"
                      : "border-gray-300"
                  }`}
                >
                  {selectedChallenges.includes(challenge) && (
                    <span className="text-gray-800 text-sm">✓</span>
                  )}
                </div>
                <span>{challenge}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedChallenges.length === 0}
          className="w-full py-4 bg-gray-800 text-white rounded-2xl hover:bg-gray-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Fortsätt ({selectedChallenges.length} utmaningar valda)
        </button>
      </div>
    </div>
  );
}

