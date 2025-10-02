"use client";

import { useState } from "react";
import promptTemplates from "@/data/prompt-templates.json";

type Profession = keyof typeof promptTemplates.professions;

export default function PromptsPage() {
  const professions = Object.keys(promptTemplates.professions) as Profession[];
  const [selectedProfession, setSelectedProfession] = useState<Profession>("Lärare");
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  const professionData = promptTemplates.professions[selectedProfession];
  const categories = Object.entries(professionData.categories);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bransch-specifika AI-Prompts
          </h1>
          <p className="text-xl text-gray-600">
            Färdiga prompts för olika yrkesgrupper
          </p>
        </div>

        {/* Profession Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Välj yrke:
          </label>
          <select
            value={selectedProfession}
            onChange={(e) => setSelectedProfession(e.target.value as Profession)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-gray-900 focus:outline-none text-lg"
          >
            {professions.map((prof) => (
              <option key={prof} value={prof}>
                {prof}
              </option>
            ))}
          </select>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {professionData.totalPrompts}
              </div>
              <div className="text-sm text-gray-600">Prompts</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {professionData.averageTimeSaved}
              </div>
              <div className="text-sm text-gray-600">Tidsbesparing/vecka</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {professionData.difficulty}
              </div>
              <div className="text-sm text-gray-600">Svårighetsgrad</div>
            </div>
          </div>
        </div>

        {/* Categories and Prompts */}
        {categories.map(([categoryName, prompts]) => (
          <div key={categoryName} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {categoryName}
            </h2>
            <div className="space-y-4">
              {prompts.map((prompt: any) => (
                <div
                  key={prompt.id}
                  className="bg-white rounded-xl shadow-md border-2 border-gray-100 hover:border-gray-300 transition-all overflow-hidden"
                >
                  {/* Header */}
                  <button
                    onClick={() =>
                      setExpandedPrompt(
                        expandedPrompt === prompt.id ? null : prompt.id
                      )
                    }
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {prompt.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {prompt.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            💾 {prompt.timeSaved}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {prompt.difficulty}
                          </span>
                          {prompt.tools?.map((tool: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                      <svg
                        className={`w-6 h-6 text-gray-400 ml-4 transform transition-transform ${
                          expandedPrompt === prompt.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedPrompt === prompt.id && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      {/* Prompt */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Prompt att kopiera:
                        </label>
                        <div className="relative">
                          <pre className="bg-white p-4 rounded-lg border border-gray-300 text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                            {prompt.prompt}
                          </pre>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(prompt.prompt);
                              alert("Prompt kopierad till urklipp!");
                            }}
                            className="absolute top-2 right-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            📋 Kopiera
                          </button>
                        </div>
                      </div>

                      {/* Example */}
                      {prompt.example && (
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Exempel:
                          </label>
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            {prompt.example}
                          </p>
                        </div>
                      )}

                      {/* How to Use */}
                      {prompt.howToUse && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Hur du använder det:
                          </label>
                          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200 whitespace-pre-wrap">
                            {prompt.howToUse}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

