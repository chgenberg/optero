"use client";

import { useState, useEffect, useRef } from "react";

interface IndustryInputProps {
  onSelect: (industry: string) => void;
}

const INDUSTRIES = [
  // Tech & Digital
  "Tech & SaaS",
  "E-handel",
  "Digital marknadsföring",
  "Spelutveckling",
  "Cybersäkerhet",
  "AI & Machine Learning",
  "Fintech",
  "Edtech",
  "Healthtech",
  
  // Traditional Industries
  "Tillverkning",
  "Detaljhandel",
  "Grossisthandel",
  "Bygg & Anläggning",
  "Transport & Logistik",
  "Energi & Miljöteknik",
  "Jordbruk & Livsmedel",
  
  // Services
  "Konsulting",
  "Juridik",
  "Redovisning & Revision",
  "Rekrytering & Bemanning",
  "PR & Kommunikation",
  "Event & Möten",
  "Utbildning",
  "Forskning & Utveckling",
  
  // Finance & Real Estate
  "Bank & Finans",
  "Försäkring",
  "Fastigheter",
  "Investeringar",
  "Kapitalförvaltning",
  
  // Healthcare & Wellness
  "Vård & Omsorg",
  "Läkemedel",
  "Medicinsk teknik",
  "Tandvård",
  "Fitness & Hälsa",
  "Skönhet & Spa",
  
  // Hospitality & Entertainment
  "Hotell & Turism",
  "Restaurang & Café",
  "Underhållning",
  "Sport & Fritid",
  "Kultur & Konst",
  "Media & Film",
  
  // Other
  "Ideell verksamhet",
  "Offentlig sektor",
  "Försvars & Säkerhet",
  "Telekommunikation",
  "Reklam & Design",
  "Arkitektur",
  "Mode & Textil",
  "Möbler & Inredning"
];

export default function IndustryInput({ onSelect }: IndustryInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredIndustries = input
    ? INDUSTRIES.filter((industry) =>
        industry.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 8)
    : INDUSTRIES.slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredIndustries.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredIndustries.length) {
        handleSelect(filteredIndustries[selectedIndex]);
      } else if (input.trim()) {
        handleSelect(input.trim());
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelect = (industry: string) => {
    setInput(industry);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSelect(industry);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Vilken bransch jobbar ni inom?"
          className="w-full px-6 py-4 text-lg border-2 border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          autoComplete="off"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {showSuggestions && filteredIndustries.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredIndustries.map((industry, index) => (
            <button
              key={industry}
              onClick={() => handleSelect(industry)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? "bg-gray-50" : ""
              } ${index !== filteredIndustries.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <span className="text-gray-900">{industry}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
