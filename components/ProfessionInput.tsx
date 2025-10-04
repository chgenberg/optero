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
    <div className="w-full max-w-2xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            id="profession"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="T.ex. Lärare, Ekonom, Projektledare..."
            className="w-full px-6 py-4 text-lg bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-gray-900 focus:outline-none transition-all duration-200 placeholder-gray-400"
            autoComplete="off"
            autoFocus
          />
          
          <button
            type="submit"
            disabled={!input.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              input.trim()
                ? "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 active:scale-95"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Suggestions with minimal design */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
            <div className="max-h-64 overflow-y-auto scrollbar-minimal">
              {suggestions.map((profession, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(profession)}
                  className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-150 border-b border-gray-50 last:border-0"
                >
                  <span className="text-gray-900 font-medium">{profession}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

    </div>
  );
}