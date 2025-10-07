"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, TrendingUp, ChevronDown, Copy, Check, Sparkles, Filter, X } from 'lucide-react';

interface Prompt {
  id: string;
  profession: string;
  specialization: string;
  task: string;
  solution: string;
  prompt: string;
  hitCount: number;
  usedInAnalyses: number;
}

interface ProfessionData {
  name: string;
  count: number;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [professions, setProfessions] = useState<ProfessionData[]>([]);
  const [popularPrompts, setPopularPrompts] = useState<Prompt[]>([]);
  const [relatedPrompts, setRelatedPrompts] = useState<Prompt[]>([]);
  const [selectedProfession, setSelectedProfession] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHowTo, setShowHowTo] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      fetchPrompts(selectedProfession, query);
    }, 300);
  }, [selectedProfession]);

  // Fetch prompts from API
  const fetchPrompts = async (profession = '', search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (profession) params.append('profession', profession);
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/prompts/search?${params}`);
      const data = await response.json();
      
      setPrompts(data.prompts || []);
      setProfessions(data.professions || []);
      setPopularPrompts(data.popularPrompts || []);
      setRelatedPrompts(data.relatedPrompts || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

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
    fetchPrompts(prof, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const clearFilters = () => {
    setSelectedProfession('');
    setSearchQuery('');
    fetchPrompts();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Hero */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              AI-PROMPTBIBLIOTEK
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upptäck över 900+ färdiga AI-prompts. Sök, filtrera och spara tid direkt.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Sök efter uppgift, lösning eller prompt..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Profession Filter and Active Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Profession Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`px-4 py-2 bg-white border rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedProfession 
                    ? 'border-gray-900 text-gray-900' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Filter className="w-4 h-4" />
                {selectedProfession || 'Filtrera på yrke'}
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 w-64 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {professions.map((prof) => (
                      <button
                        key={prof.name}
                        onClick={() => handleProfessionChange(prof.name)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900">{prof.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {prof.count}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active Filters */}
            {(selectedProfession || searchQuery) && (
              <div className="flex items-center gap-2">
                {selectedProfession && (
                  <span className="px-3 py-1 bg-gray-900 text-white text-sm rounded-lg flex items-center gap-2">
                    {selectedProfession}
                    <button
                      onClick={() => handleProfessionChange('')}
                      className="hover:bg-gray-700 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg flex items-center gap-2">
                    "{searchQuery}"
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        fetchPrompts(selectedProfession, '');
                      }}
                      className="hover:bg-gray-300 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Rensa alla filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Popular Prompts Section */}
        {!selectedProfession && !searchQuery && popularPrompts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Populära prompts just nu
            </h2>
            <div className="grid gap-4">
              {popularPrompts.slice(0, 5).map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-600">{prompt.profession}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Använd {prompt.hitCount} gånger
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{prompt.task}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{prompt.solution}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedPrompt === prompt.id ? 'rotate-180' : ''
                    }`} />
                  </div>

                  {expandedPrompt === prompt.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <PromptDetails 
                        prompt={prompt} 
                        onCopy={handleCopy}
                        copiedId={copiedId}
                        showHowTo={showHowTo}
                        setShowHowTo={setShowHowTo}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Prompts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              Laddar prompts...
            </div>
          </div>
        ) : prompts.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {selectedProfession 
                ? `Prompts för ${selectedProfession} (${prompts.length})`
                : searchQuery
                ? `Sökresultat (${prompts.length})`
                : `Alla prompts (${prompts.length})`
              }
            </h2>
            
            <div className="grid gap-4">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all cursor-pointer"
                  onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-600">{prompt.profession}</span>
                        {prompt.specialization && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{prompt.specialization}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{prompt.task}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{prompt.solution}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedPrompt === prompt.id ? 'rotate-180' : ''
                    }`} />
                  </div>

                  {expandedPrompt === prompt.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                      <PromptDetails 
                        prompt={prompt} 
                        onCopy={handleCopy}
                        copiedId={copiedId}
                        showHowTo={showHowTo}
                        setShowHowTo={setShowHowTo}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Related Prompts */}
            {selectedProfession && relatedPrompts.length > 0 && (
              <div className="mt-12 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Relaterade prompts för {selectedProfession}
                </h3>
                <div className="space-y-3">
                  {relatedPrompts.slice(0, 5).map((prompt) => (
                    <div
                      key={prompt.id}
                      className="p-4 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        setExpandedPrompt(prompt.id);
                        // Scroll to prompt
                        const element = document.getElementById(`prompt-${prompt.id}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                    >
                      <h4 className="font-medium text-gray-900 mb-1">{prompt.task}</h4>
                      <p className="text-sm text-gray-600 line-clamp-1">{prompt.solution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inga prompts hittades</h3>
            <p className="text-gray-600">Prova att ändra dina sökkriterier</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Prompt Details Component
function PromptDetails({ 
  prompt, 
  onCopy, 
  copiedId,
  showHowTo,
  setShowHowTo
}: { 
  prompt: Prompt; 
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  showHowTo: string | null;
  setShowHowTo: (id: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Solution */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Lösning:</h4>
        <p className="text-gray-700">{prompt.solution}</p>
      </div>

      {/* Prompt */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">Prompt:</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHowTo(showHowTo === prompt.id ? null : prompt.id);
              }}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Så här gör du
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy(prompt.prompt, prompt.id);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                copiedId === prompt.id
                  ? "bg-green-600 text-white"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
              }`}
            >
              {copiedId === prompt.id ? (
                <>
                  <Check className="w-4 h-4" />
                  Kopierad!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Kopiera
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
          <pre
            className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono"
            dangerouslySetInnerHTML={{
              __html: prompt.prompt
                .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                .replace(/\[([^\]]+)\]/g, '<span class="bg-yellow-400 text-gray-900 px-1 rounded font-bold">[$1]</span>')
            }}
          />
        </div>
      </div>

      {/* How to use popup */}
      {showHowTo === prompt.id && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-semibold text-blue-900 mb-2">Så här använder du prompten:</h5>
          <ol className="space-y-2 text-sm text-blue-800">
            <li>1. Kopiera prompten ovan</li>
            <li>2. Öppna ChatGPT, Claude eller annan AI-tjänst</li>
            <li>3. Klistra in prompten</li>
            <li>4. Fyll i de <span className="bg-yellow-200 px-1 rounded text-gray-900 font-semibold">[gula fälten]</span> med din information</li>
            <li>5. Skicka och få ditt resultat!</li>
          </ol>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Sparkles className="w-4 h-4" />
          Använd {prompt.hitCount} gånger
        </span>
        <span>•</span>
        <span>Genererad i {prompt.usedInAnalyses} analyser</span>
      </div>
    </div>
  );
}