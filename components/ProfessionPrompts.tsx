"use client";

import { useState } from "react";
import promptTemplates from "@/data/prompt-templates.json";

interface ProfessionPromptsProps {
  profession: string;
}

type Profession = keyof typeof promptTemplates.professions;

export default function ProfessionPrompts({ profession }: ProfessionPromptsProps) {
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Check if we have specific prompts for this profession
  const normalizedProfession = profession as Profession;
  const professionData = promptTemplates.professions[normalizedProfession];

  if (!professionData) {
    return null; // No specific prompts for this profession
  }

  const categories = Object.entries(professionData.categories);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 lg:p-8 border-2 border-blue-200">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              ⚡ Färdiga AI-Prompts för {profession}
            </h3>
            <p className="text-sm text-gray-600">
              {professionData.totalPrompts} prompts • Spara {professionData.averageTimeSaved}
            </p>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm lg:text-base">
          Kopiera dessa färdiga prompts direkt till ChatGPT och fyll i dina specifika detaljer. 
          Inga tekniska kunskaper krävs - bara klistra in och börja!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 lg:p-4 border border-blue-200">
          <div className="text-xl lg:text-2xl font-bold text-blue-600">
            {professionData.totalPrompts}
          </div>
          <div className="text-xs lg:text-sm text-gray-600">Färdiga prompts</div>
        </div>
        <div className="bg-white rounded-xl p-3 lg:p-4 border border-blue-200">
          <div className="text-xl lg:text-2xl font-bold text-green-600">
            {professionData.averageTimeSaved}
          </div>
          <div className="text-xs lg:text-sm text-gray-600">Tidsbesparing</div>
        </div>
        <div className="bg-white rounded-xl p-3 lg:p-4 border border-blue-200 col-span-2 lg:col-span-1">
          <div className="text-xl lg:text-2xl font-bold text-purple-600">
            {professionData.difficulty}
          </div>
          <div className="text-xs lg:text-sm text-gray-600">Svårighetsgrad</div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map(([categoryName, prompts], catIndex) => (
          <div key={categoryName} className="bg-white rounded-xl border-2 border-blue-100 overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(expandedCategory === categoryName ? null : categoryName)}
              className="w-full p-4 text-left hover:bg-blue-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                  {prompts.length}
                </div>
                <h4 className="font-bold text-gray-900 text-base lg:text-lg">
                  {categoryName}
                </h4>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transform transition-transform ${
                  expandedCategory === categoryName ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Prompts in Category */}
            {expandedCategory === categoryName && (
              <div className="border-t border-blue-100 p-4 space-y-3 bg-gray-50">
                {prompts.map((prompt: any) => (
                  <div
                    key={prompt.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-300 transition-all"
                  >
                    {/* Prompt Header */}
                    <button
                      onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">
                            {prompt.name}
                          </h5>
                          <p className="text-xs lg:text-sm text-gray-600 mb-2">
                            {prompt.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              💾 {prompt.timeSaved}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {prompt.difficulty}
                            </span>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transform transition-transform ${
                            expandedPrompt === prompt.id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded Prompt Content */}
                    {expandedPrompt === prompt.id && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                        {/* Prompt Text */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs lg:text-sm font-semibold text-gray-700">
                              📋 Kopiera denna prompt:
                            </label>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(prompt.prompt);
                                alert("✅ Prompt kopierad! Klistra in i ChatGPT.");
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Kopiera
                            </button>
                          </div>
                          <pre className="bg-white p-3 rounded-lg border border-gray-300 text-xs whitespace-pre-wrap font-mono overflow-x-auto max-h-60 overflow-y-auto">
                            {prompt.prompt}
                          </pre>
                        </div>

                        {/* Tools */}
                        {prompt.tools && prompt.tools.length > 0 && (
                          <div>
                            <label className="text-xs lg:text-sm font-semibold text-gray-700 mb-2 block">
                              🛠️ Fungerar med:
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {prompt.tools.map((tool: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-300"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Example */}
                        {prompt.example && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <label className="text-xs font-semibold text-blue-900 mb-1 block">
                              💡 Exempel:
                            </label>
                            <p className="text-xs text-blue-800">{prompt.example}</p>
                          </div>
                        )}

                        {/* How to Use */}
                        {prompt.howToUse && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <label className="text-xs font-semibold text-green-900 mb-1 block">
                              ✅ Så här använder du det:
                            </label>
                            <p className="text-xs text-green-800 whitespace-pre-wrap">{prompt.howToUse}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6 p-4 bg-white rounded-xl border-2 border-blue-200 text-center">
        <p className="text-sm text-gray-700 mb-3">
          <strong>Tips:</strong> Börja med den första prompten i varje kategori - de är designade för att ge snabbast resultat!
        </p>
        <a
          href="/prompts"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Se alla {professionData.totalPrompts} prompts i fullskärm
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
