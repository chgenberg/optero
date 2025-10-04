"use client";

import React, { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
              AI-prompts för alla yrken
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Över 130 färdiga prompts som sparar dig 5-15 timmar varje vecka
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profession selector - minimal design */}
        <div className="mb-12">
          <label htmlFor="profession-select" className="block text-sm font-medium text-gray-700 mb-3">
            Välj ditt yrke
          </label>
          <select
            id="profession-select"
            className="w-full max-w-md px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-gray-900 focus:outline-none transition-all duration-200"
            value={selectedProfession}
            onChange={(e) => handleProfessionChange(e.target.value)}
          >
            <option value="">-- Välj ett yrke --</option>
            {Object.keys(professions).map((prof) => (
              <option key={prof} value={prof}>
                {prof} ({professions[prof].totalPrompts} prompts)
              </option>
            ))}
          </select>
        </div>

        {selectedProfession && professions[selectedProfession] && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Profession stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="card text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {professions[selectedProfession].totalPrompts}
                </div>
                <div className="text-gray-600">Färdiga prompts</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {professions[selectedProfession].averageTimeSaved}
                </div>
                <div className="text-gray-600">Tidsbesparing</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {professions[selectedProfession].difficulty}
                </div>
                <div className="text-gray-600">Svårighetsgrad</div>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 pb-6 border-b border-gray-100">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Prompts grid */}
            <div className="grid gap-4">
              {selectedPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className={`card-interactive group ${
                    expandedPrompt === prompt.id ? "ring-2 ring-gray-900" : ""
                  }`}
                  onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                >
                  {/* Prompt header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {prompt.name}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {prompt.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        prompt.difficulty === 'Lätt' 
                          ? 'bg-green-100 text-green-800' 
                          : prompt.difficulty === 'Medel' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {prompt.difficulty}
                      </span>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          expandedPrompt === prompt.id ? "rotate-180" : ""
                        }`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Time saved badge */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sparar {prompt.timeSaved}
                  </div>

                  {/* Expanded content */}
                  {expandedPrompt === prompt.id && (
                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                      {/* Prompt to copy */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">Prompt att kopiera:</h5>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(prompt.prompt, prompt.id);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              copiedId === prompt.id
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                          >
                            {copiedId === prompt.id ? "✓ Kopierad!" : "Kopiera"}
                          </button>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {prompt.prompt}
                        </div>
                      </div>

                      {/* Example */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Exempel:</h5>
                        <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-4">
                          {prompt.example}
                        </p>
                      </div>

                      {/* How to use */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Så här använder du prompten:</h5>
                        <div className="text-gray-600 text-sm space-y-2">
                          {prompt.howToUse.split('\n').map((line, i) => (
                            <p key={i} className="flex items-start">
                              {line.includes('→') && <span className="mr-2">•</span>}
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Tools */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Fungerar med:</h5>
                        <div className="flex flex-wrap gap-2">
                          {prompt.tools.map((tool, i) => (
                            <span 
                              key={i} 
                              className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full"
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

        {/* CTA section */}
        {!selectedProfession && (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Börja spara tid redan idag
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Välj ditt yrke ovan för att se alla färdiga AI-prompts som kan effektivisera din arbetsdag
            </p>
            <a
              href="/"
              className="btn-primary inline-flex items-center gap-2"
            >
              Hitta AI-verktyg för ditt yrke
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}