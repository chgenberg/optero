"use client";

import { useState, useEffect } from "react";
import specData from "@/data/specializations.json";

interface SpecializationInputProps {
  profession: string;
  onSelect: (specialization: string) => void;
  onBack: () => void;
}

export default function SpecializationInput({
  profession,
  onSelect,
  onBack,
}: SpecializationInputProps) {
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const all: Record<string, string[]> = (specData as any).specializations || {};
    const lowerMap: Record<string, string[]> = Object.fromEntries(
      Object.entries(all).map(([k, v]) => [k.toLowerCase(), v as string[]])
    );
    const normalized = profession.toLowerCase();

    async function load() {
      // 1) Försök AI först (som tidigare beteende)
      setLoading(true);
      try {
        const ai = await fetch("/api/specializations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profession }),
        }).then((r) => r.json());

        if (Array.isArray(ai?.specializations) && ai.specializations.length > 0) {
          setSpecializations(ai.specializations);
          return;
        }
      } catch {}

      // 2) Fallback lokalt (case-insensitive + fuzzy)
      let local = lowerMap[normalized];
      if (!local) {
        const hit = Object.keys(lowerMap).find(
          (k) => normalized.includes(k) || k.includes(normalized)
        );
        if (hit) local = lowerMap[hit];
      }
      if (local && local.length > 0) {
        setSpecializations(local);
        return;
      }

      // 3) Sista fallback: defaults
      setSpecializations((specData as any).defaults);
      setLoading(false);
    }

    load().finally(() => setLoading(false));
  }, [profession]);

  const handleSelect = (spec: string) => {
    onSelect(spec);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelect(customInput.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up px-4">
      <div className="relative bg-white rounded-2xl lg:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 border border-gray-100 overflow-hidden">
        <div className="absolute inset-0 gradient-radial pointer-events-none" />
        <button
          onClick={onBack}
          className="mb-4 sm:mb-6 text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          ← Tillbaka
        </button>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-6 lg:mb-8">
          Vilken inriktning har du inom <br />
          <span className="font-bold">{profession.toLowerCase()}</span>?
        </h2>

        {loading ? (
          <div className="w-full flex items-center justify-center py-8 sm:py-12">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {specializations.map((spec, index) => (
              <button
                key={index}
                onClick={() => handleSelect(spec)}
                className="p-3 sm:p-4 text-sm sm:text-base bg-gray-50 hover:bg-gray-100 rounded-xl lg:rounded-2xl transition-colors duration-150 text-left border-2 border-transparent hover:border-gray-300"
              >
                {spec}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
          <form onSubmit={handleCustomSubmit}>
            <div className="text-center mb-4">
              <p className="text-sm sm:text-base text-gray-700 font-medium mb-1">
                Hittar du inte din inriktning?
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Skriv in din egen specialisering nedan
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="custom"
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="flex-1 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-300 rounded-xl lg:rounded-2xl focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all"
                placeholder="T.ex. B2B-säljare, Fastighetssäljare..."
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gray-900 text-white rounded-xl lg:rounded-2xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Fortsätt →
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              💡 Skriv så specifikt som möjligt för bästa resultat
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

