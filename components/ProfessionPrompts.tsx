"use client";

import React, { useState, useEffect } from 'react';
import promptData from '@/data/prompt-templates.json';

interface Prompt {
  id: string;
  name: string;
  description: string;
  timeSaved: string;
  difficulty: string;
  prompt?: string;
  example?: string;
  howToUse?: string;
  tools?: string[];
  challenge?: string;
  solution?: string;
  bestPractice?: string;
  expectedOutcome?: string;
  category?: string;
  agentReady?: boolean;
  multiModal?: boolean;
}

interface Category {
  [key: string]: Prompt[];
}

interface ProfessionData {
  categories: Category;
  totalPrompts: number;
  averageTimeSaved: string;
  difficulty: string;
}

interface Scenario {
  title: string;
  situation: string;
  solution: string;
  tools: string[];
  prompts?: Prompt[];
}

interface ProfessionPromptsProps {
  profession: string;
  scenarios?: Scenario[];
}

const allProfessions: { [key: string]: ProfessionData } = promptData.professions;

export default function ProfessionPrompts({ profession, scenarios = [] }: ProfessionPromptsProps) {
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [currentProfessionData, setCurrentProfessionData] = useState<ProfessionData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dbPrompts, setDbPrompts] = useState<Prompt[]>([]);
  const [loadingDbPrompts, setLoadingDbPrompts] = useState(false);

  useEffect(() => {
    // Collect prompts from scenarios
    const scenarioPrompts: Prompt[] = [];
    scenarios.forEach(scenario => {
      if (scenario.prompts && scenario.prompts.length > 0) {
        scenarioPrompts.push(...scenario.prompts);
      }
    });
    
    // If we have prompts from scenarios, use them
    if (scenarioPrompts.length > 0) {
      setDbPrompts(scenarioPrompts);
      // Create a dummy profession data structure
      const categories: Category = {};
      scenarioPrompts.forEach(prompt => {
        const category = prompt.category || 'Generellt';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(prompt);
      });
      
      setCurrentProfessionData({
        categories,
        totalPrompts: scenarioPrompts.length,
        averageTimeSaved: "2-4 timmar per vecka",
        difficulty: "Medel"
      });
      
      const categoryKeys = Object.keys(categories);
      setSelectedCategory(categoryKeys[0]);
      return;
    }
    
    // Try to fetch from database first
    const fetchDbPrompts = async () => {
      if (!profession) return;
      
      setLoadingDbPrompts(true);
      try {
        const response = await fetch(`/api/prompts/get?profession=${encodeURIComponent(profession)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.prompts && data.prompts.length > 0) {
            // Convert DB prompts to component format
            setDbPrompts(data.prompts);
          }
        }
      } catch (error) {
        console.log('Could not fetch DB prompts, using JSON fallback');
      } finally {
        setLoadingDbPrompts(false);
      }
    };

    fetchDbPrompts();

    // Fallback to JSON data
    if (profession && allProfessions[profession]) {
      setCurrentProfessionData(allProfessions[profession]);
      const categories = Object.keys(allProfessions[profession].categories);
      setSelectedCategory(categories[0]);
    } else {
      setCurrentProfessionData(null);
      setSelectedCategory(null);
    }
  }, [profession, scenarios]);

  const handleCopy = async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(promptId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!currentProfessionData) {
    return null;
  }

  const categories = Object.keys(currentProfessionData.categories);
  const selectedPrompts = selectedCategory ? currentProfessionData.categories[selectedCategory] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          AI-prompts för {profession}
        </h3>
        <p className="text-gray-600">
          {currentProfessionData.totalPrompts} färdiga prompts som sparar {currentProfessionData.averageTimeSaved}
        </p>
      </div>

      {/* Category tabs - minimal design */}
      <div className="flex flex-wrap justify-center gap-2 pb-6 border-b border-gray-100">
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
                        handleCopy(prompt.prompt || prompt.description, prompt.id);
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
                    {prompt.prompt || prompt.description}
                  </div>
                </div>

                {/* Example */}
                {prompt.example && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Exempel:</h5>
                    <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-4">
                      {prompt.example}
                    </p>
                  </div>
                )}

                {/* How to use */}
                {prompt.howToUse && (
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
                )}

                {/* Tools */}
                {prompt.tools && prompt.tools.length > 0 && (
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
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}