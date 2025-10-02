"use client";

import { useState, useEffect, useRef } from "react";
import professionsData from "@/data/professions.json";

interface ProfessionInputProps {
  onSelect: (profession: string) => void;
}

const PROFESSIONS = professionsData.professions.map(p => p.name);

export default function ProfessionInput({ onSelect }: ProfessionInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.length > 0) {
      const filtered = PROFESSIONS.filter((prof) =>
        prof.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  const handleSelect = (profession: string) => {
    setInput(profession);
    setShowSuggestions(false);
    onSelect(profession);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSelect(input.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up px-4">
      <div className="relative bg-white rounded-2xl lg:rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 border border-gray-100 animate-pulse-scale hover:shadow-2xl transition-shadow duration-300">
        <div className="absolute inset-0 gradient-radial pointer-events-none" />
        
        <form onSubmit={handleSubmit}>
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-wide uppercase mb-6 lg:mb-8 leading-tight">
              DITT ARBETE. DIN AI.<br className="hidden sm:block" /> DIN SUPERKRAFT.
            </h1>
            <label htmlFor="profession" className="block">
              <span className="text-lg sm:text-xl font-semibold text-gray-800 tracking-wide uppercase">
                VAD JOBBAR DU MED?
              </span>
            </label>
          </div>
          
          <div className="relative group">
            <input
              ref={inputRef}
              id="profession"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full px-4 sm:px-6 py-4 sm:py-5 text-lg sm:text-xl text-center border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-gray-900 focus:shadow-lg focus:scale-105 hover:border-gray-400 hover:bg-gray-50 outline-none transition-all duration-300 transform bg-white"
              placeholder="Skriv ditt yrke..."
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg sm:rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 opacity-0 group-focus-within:opacity-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 max-h-48 sm:max-h-64 overflow-y-auto z-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="sticky top-0 bg-gradient-to-b from-white via-white to-transparent px-4 py-2 text-xs text-gray-500 font-medium z-10">
                  {suggestions.length} förslag • Scrolla för fler
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(suggestion)}
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {suggestion}
                  </button>
                ))}
                <div className="sticky bottom-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>
            )}
          </div>

          {input.trim() && (
            <button
              type="submit"
              className="mt-6 w-full py-3 bg-gray-800 text-white rounded-2xl hover:bg-gray-700 transition-all duration-200 font-medium"
            >
              Fortsätt
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

