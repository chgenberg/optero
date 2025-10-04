"use client";

import React, { useState, useEffect, useRef } from 'react';
import promptData from '@/data/prompt-templates.json';

interface Prompt {
  id: string;
  name: string;
  description: string;
  timeSaved: string;
  difficulty: string;
  prompt: string;
  example: string;
  howToUse: string;
  tools: string[];
}

interface Category {
  [key: string]: Prompt[];
}

interface Profession {
  [key: string]: {
    categories: Category;
    totalPrompts: number;
    averageTimeSaved: string;
    difficulty: string;
  };
}

const professions: Profession = promptData.professions;

export default function PromptsPage() {
  const [selectedProfession, setSelectedProfession] = useState<string>('');
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(promptId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleProfessionChange = (prof: string) => {
    setSelectedProfession(prof);
    setExpandedPrompt(null);
    setIsDropdownOpen(false);
    setSearchQuery('');
    if (prof && professions[prof]) {
      const categories = Object.keys(professions[prof].categories);
      setSelectedCategory(categories[0]);
    } else {
      setSelectedCategory(null);
    }
  };

  const categories = selectedProfession && professions[selectedProfession] 
    ? Object.keys(professions[selectedProfession].categories) 
    : [];
  
  const selectedPrompts = selectedProfession && selectedCategory && professions[selectedProfession]
    ? professions[selectedProfession].categories[selectedCategory] || []
    : [];

  // Filter professions based on search
  const filteredProfessions = Object.keys(professions).filter(prof =>
    prof.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero section with animated gradient */}
      <div className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 animate-gradient"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-black text-gray-900 mb-6 animate-fade-in-up">
              AI-PROMPTS
            </h1>
            <div className="flex items-center justify-center gap-4 text-xl sm:text-2xl text-gray-600 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="font-light">Över</span>
              <span className="font-black text-gray-900 text-3xl sm:text-4xl animate-pulse-scale">130+</span>
              <span className="font-light">färdiga prompts</span>
            </div>
            <p className="text-lg text-gray-500 mt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Spara 5-15 timmar varje vecka
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Custom dropdown */}
        <div className="mb-16 max-w-md mx-auto" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
            Välj ditt yrke
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full px-6 py-4 bg-white border-2 rounded-2xl text-left font-medium transition-all duration-300 ${
                isDropdownOpen 
                  ? 'border-gray-900 shadow-xl transform scale-[1.02]' 
                  : 'border-gray-200 hover:border-gray-400 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={selectedProfession ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedProfession || 'Välj ditt yrke...'}
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {selectedProfession && (
                <span className="text-sm text-gray-500 mt-1 block">
                  {professions[selectedProfession].totalPrompts} prompts tillgängliga
                </span>
              )}
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                {/* Search input */}
                <div className="p-3 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Sök yrke..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900"
                    autoFocus
                  />
                </div>
                
                {/* Options */}
                <div className="max-h-80 overflow-y-auto scrollbar-minimal">
                  {filteredProfessions.length > 0 ? (
                    filteredProfessions.map((prof) => (
                      <button
                        key={prof}
                        onClick={() => handleProfessionChange(prof)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 group-hover:translate-x-1 transition-transform">
                            {prof}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full group-hover:bg-gray-900 group-hover:text-white transition-all">
                            {professions[prof].totalPrompts} prompts
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      Inget yrke matchade din sökning
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedProfession && professions[selectedProfession] && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Animated stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="group">
                <div className="card-stats">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="relative">
                    <div className="text-4xl font-black text-gray-900 mb-2 group-hover:scale-110 transition-transform">
                      {professions[selectedProfession].totalPrompts}
                    </div>
                    <div className="text-sm text-gray-600 uppercase tracking-wider">Färdiga prompts</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 rounded-full animate-pulse-scale"></div>
                </div>
              </div>
              
              <div className="group">
                <div className="card-stats">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="relative">
                    <div className="text-4xl font-black text-gray-900 mb-2 group-hover:scale-110 transition-transform">
                      {professions[selectedProfession].averageTimeSaved}
                    </div>
                    <div className="text-sm text-gray-600 uppercase tracking-wider">Tidsbesparing</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="group">
                <div className="card-stats">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="relative">
                    <div className="text-4xl font-black text-gray-900 mb-2 group-hover:scale-110 transition-transform">
                      {professions[selectedProfession].difficulty}
                    </div>
                    <div className="text-sm text-gray-600 uppercase tracking-wider">Svårighetsgrad</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>

            {/* Category pills with hover effects */}
            <div className="flex flex-wrap gap-3 pb-8 border-b border-gray-100">
              {categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category
                      ? "bg-gray-900 text-white shadow-lg"
                      : "bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-400 hover:shadow-md"
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Prompts with enhanced interactivity */}
            <div className="grid gap-4">
              {selectedPrompts.map((prompt, index) => (
                <div
                  key={prompt.id}
                  className={`card-prompt group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] ${
                    expandedPrompt === prompt.id ? "ring-2 ring-gray-900 shadow-2xl" : "hover:shadow-xl"
                  }`}
                  onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Prompt header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {prompt.name}
                      </h4>
                      <p className="text-gray-600">
                        {prompt.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                        prompt.difficulty === 'Lätt' 
                          ? 'bg-green-100 text-green-800 group-hover:bg-green-200' 
                          : prompt.difficulty === 'Medel' 
                          ? 'bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200' 
                          : 'bg-red-100 text-red-800 group-hover:bg-red-200'
                      }`}>
                        {prompt.difficulty}
                      </span>
                      <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 ${
                        expandedPrompt === prompt.id ? "bg-gray-900 rotate-180" : "group-hover:bg-gray-200"
                      }`}>
                        <svg 
                          className={`w-5 h-5 transition-colors ${
                            expandedPrompt === prompt.id ? "text-white" : "text-gray-600"
                          }`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Time saved badge with pulse */}
                  <div className="inline-flex items-center gap-2 text-sm bg-gray-100 px-4 py-2 rounded-full group-hover:bg-gray-900 group-hover:text-white transition-all">
                    <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sparar {prompt.timeSaved}
                  </div>

                  {/* Expanded content with smooth animation */}
                  {expandedPrompt === prompt.id && (
                    <div className="mt-8 pt-8 border-t-2 border-gray-100 space-y-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                      {/* Prompt to copy */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Prompt att kopiera:</h5>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(prompt.prompt, prompt.id);
                            }}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                              copiedId === prompt.id
                                ? "bg-green-500 text-white shadow-lg"
                                : "bg-gray-900 hover:bg-gray-800 text-white shadow-md"
                            }`}
                          >
                            {copiedId === prompt.id ? "✓ Kopierad!" : "Kopiera prompt"}
                          </button>
                        </div>
                        <div className="bg-gray-900 text-gray-100 rounded-2xl p-6 font-mono text-sm leading-relaxed shadow-inner">
                          {prompt.prompt}
                        </div>
                      </div>

                      {/* Example with gradient background */}
                      <div>
                        <h5 className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-4">Exempel:</h5>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-gray-700">
                          {prompt.example}
                        </div>
                      </div>

                      {/* How to use with numbered steps */}
                      <div>
                        <h5 className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-4">Så här använder du:</h5>
                        <div className="space-y-3">
                          {prompt.howToUse.split('\n').map((line, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {i + 1}
                              </span>
                              <p className="text-gray-700 pt-1">{line}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tools with animated badges */}
                      <div>
                        <h5 className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-4">Fungerar med:</h5>
                        <div className="flex flex-wrap gap-3">
                          {prompt.tools.map((tool, i) => (
                            <span 
                              key={i} 
                              className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full transform transition-all hover:scale-110 hover:bg-gray-800 cursor-default animate-fade-in"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced CTA section */}
        {!selectedProfession && (
          <div className="text-center py-24">
            <div className="inline-block animate-float">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              BÖRJA SPARA TID IDAG
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Välj ditt yrke ovan för att se alla färdiga AI-prompts som kan revolutionera din arbetsdag
            </p>
            <a
              href="/"
              className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4 transform transition-all hover:scale-105"
            >
              <span>Hitta dina AI-verktyg</span>
              <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}