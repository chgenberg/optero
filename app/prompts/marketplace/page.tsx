"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Star, Clock, Lock, Copy, Check, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface Prompt {
  id: string;
  name: string;
  description: string;
  category: string;
  profession: string;
  specialization?: string;
  timeSaved: string;
  difficulty: string;
  rating: number;
  usageCount: number;
  isPremium: boolean;
  prompt: string;
  tags: string[];
}

const CATEGORIES = [
  "Alla kategorier",
  "Dokumentation",
  "Kommunikation",
  "Analys",
  "Planering",
  "Automation",
  "Kreativitet",
  "Ledarskap",
];

const PROFESSIONS = [
  "Alla yrken",
  "Lärare",
  "Ekonom",
  "Utvecklare",
  "Marknadsförare",
  "Säljare",
  "HR-specialist",
  "Projektledare",
  "Advokat",
  "Läkare",
];

export default function PromptMarketplace() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alla kategorier");
  const [selectedProfession, setSelectedProfession] = useState("Alla yrken");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Alla");
  const [showOnlyFree, setShowOnlyFree] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState("free");

  useEffect(() => {
    fetchPrompts();
    checkUserSubscription();
  }, []);

  useEffect(() => {
    filterPrompts();
  }, [searchQuery, selectedCategory, selectedProfession, selectedDifficulty, showOnlyFree, prompts]);

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts/marketplace");
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserSubscription = () => {
    // TODO: Check actual subscription
    const tier = sessionStorage.getItem("userTier") || "free";
    setUserTier(tier);
  };

  const filterPrompts = () => {
    let filtered = prompts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "Alla kategorier") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Profession filter
    if (selectedProfession !== "Alla yrken") {
      filtered = filtered.filter(p => p.profession === selectedProfession);
    }

    // Difficulty filter
    if (selectedDifficulty !== "Alla") {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty);
    }

    // Premium filter
    if (showOnlyFree) {
      filtered = filtered.filter(p => !p.isPremium);
    }

    setFilteredPrompts(filtered);
  };

  const copyPrompt = async (prompt: Prompt) => {
    if (prompt.isPremium && userTier === "free") {
      router.push("/prenumeration");
      return;
    }

    await navigator.clipboard.writeText(prompt.prompt);
    setCopiedId(prompt.id);
    
    // Track usage
    fetch("/api/prompts/track-usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId: prompt.id, action: "copy" }),
    });

    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Laddar prompt-biblioteket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Prompt-bibliotek
          </h1>
          <p className="text-lg text-gray-600">
            Upptäck {prompts.length}+ färdiga AI-prompts som sparar dig timmar varje vecka
          </p>
          
          {userTier === "free" && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Du har tillgång till gratisprompts. 
                <button 
                  onClick={() => router.push("/prenumeration")}
                  className="ml-2 font-medium underline hover:no-underline"
                >
                  Uppgradera för att låsa upp alla prompts →
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Sök prompts..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Profession filter */}
            <select
              value={selectedProfession}
              onChange={(e) => setSelectedProfession(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {PROFESSIONS.map(prof => (
                <option key={prof} value={prof}>{prof}</option>
              ))}
            </select>

            {/* Difficulty filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Alla">Alla svårighetsgrader</option>
              <option value="Lätt">Lätt</option>
              <option value="Medel">Medel</option>
              <option value="Avancerat">Avancerat</option>
            </select>

            {/* Free only toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyFree}
                onChange={(e) => setShowOnlyFree(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Visa endast gratis</span>
            </label>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">
          Visar {filteredPrompts.length} prompts
        </p>

        {/* Prompts grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 relative"
            >
              {/* Premium badge */}
              {prompt.isPremium && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Premium
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-20">
                  {prompt.name}
                </h3>
                <p className="text-sm text-gray-600">{prompt.description}</p>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Sparar {prompt.timeSaved}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-600">{prompt.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{prompt.usageCount} användningar</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  prompt.difficulty === "Lätt" ? "bg-green-100 text-green-700" :
                  prompt.difficulty === "Medel" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {prompt.difficulty}
                </span>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                  {prompt.category}
                </span>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                  {prompt.profession}
                </span>
              </div>

              {/* Prompt preview */}
              <div className="mb-4">
                <div className={`p-3 bg-gray-50 rounded-lg text-sm font-mono text-gray-700 ${
                  prompt.isPremium && userTier === "free" ? "blur-sm" : ""
                }`}>
                  {prompt.isPremium && userTier === "free" 
                    ? "Denna prompt är endast tillgänglig för premium-användare..."
                    : prompt.prompt.substring(0, 150) + "..."
                  }
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => copyPrompt(prompt)}
                  disabled={prompt.isPremium && userTier === "free"}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    prompt.isPremium && userTier === "free"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {copiedId === prompt.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Kopierad!
                    </>
                  ) : (
                    <>
                      {prompt.isPremium && userTier === "free" && <Lock className="w-4 h-4" />}
                      <Copy className="w-4 h-4" />
                      Kopiera prompt
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push(`/prompts/${prompt.id}`)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Visa mer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Inga prompts hittades med dina filter.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Alla kategorier");
                setSelectedProfession("Alla yrken");
                setSelectedDifficulty("Alla");
                setShowOnlyFree(false);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Rensa alla filter
            </button>
          </div>
        )}

        {/* CTA for free users */}
        {userTier === "free" && filteredPrompts.some(p => p.isPremium) && (
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              Lås upp {prompts.filter(p => p.isPremium).length}+ premium-prompts
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Få obegränsad tillgång till alla prompts och spara ännu mer tid
            </p>
            <button
              onClick={() => router.push("/prenumeration")}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Se prenumerationsplaner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
