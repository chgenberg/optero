"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import {
  fetchAgentTypes,
  fetchAgentCategories,
  generateSystemPrompt,
  createAgentProfile,
  type AgentType,
  type AgentCategory,
} from "@/lib/agents-client";

interface OnboardingStep {
  type: "agent_selection" | "category_tree" | "questions" | "summary";
  data?: any;
}

interface OnboardingProps {
  botId: string;
  onComplete: (profile: {
    agentTypeId: string;
    systemPrompt: string;
    mascot: string;
  }) => void;
}

export default function AgentTreeOnboarding({
  botId,
  onComplete,
}: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>({
    type: "agent_selection",
  });
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [categories, setCategories] = useState<AgentCategory[]>([]);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | null>(
    null
  );
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load agent types on mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        const types = await fetchAgentTypes();
        setAgentTypes(types);
      } catch (err) {
        setError("Failed to load agent types");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  // Load categories when agent is selected
  useEffect(() => {
    if (
      selectedAgent &&
      step.type === "category_tree" &&
      categories.length === 0
    ) {
      const loadCategories = async () => {
        try {
          setLoading(true);
          const data = await fetchAgentCategories(selectedAgent.slug);
          setCategories(data.categories);
        } catch (err) {
          setError("Failed to load categories");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      loadCategories();
    }
  }, [selectedAgent, step.type, categories.length]);

  const handleSelectAgent = (agent: AgentType) => {
    setSelectedAgent(agent);
    setStep({ type: "category_tree" });
  };

  const handleSelectCategory = (category: AgentCategory) => {
    const newPath = [...selectedPath, category.slug];
    setSelectedPath(newPath);
    setSelectedCategory(category);

    // If this is a leaf category (has no children), show questions
    if (!category.children || category.children.length === 0) {
      setStep({ type: "questions", data: category });
    }
  };

  const handleBack = () => {
    if (selectedPath.length === 0) {
      setSelectedAgent(null);
      setStep({ type: "agent_selection" });
    } else {
      const newPath = selectedPath.slice(0, -1);
      setSelectedPath(newPath);
      setSelectedCategory(null);
    }
  };

  const handleResponseChange = (question: string, answer: string) => {
    setResponses((prev) => ({
      ...prev,
      [question]: answer,
    }));
  };

  const handleComplete = async () => {
    if (!selectedAgent || !selectedCategory) {
      setError("Invalid selection");
      return;
    }

    try {
      setLoading(true);

      // Generate system prompt
      const { systemPrompt } = await generateSystemPrompt({
        agentTypeId: selectedAgent.id,
        selectedCategoryPath: selectedPath,
        onboardingResponses: responses,
      });

      // Create agent profile
      const profile = await createAgentProfile({
        botId,
        agentTypeId: selectedAgent.id,
        selectedCategoryPath: selectedPath,
        onboardingResponses: responses,
        systemPrompt,
      });

      onComplete({
        agentTypeId: selectedAgent.id,
        systemPrompt,
        mascot: selectedAgent.mascot,
      });
    } catch (err) {
      setError("Failed to complete onboarding");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLevelCategories = (): AgentCategory[] => {
    if (selectedPath.length === 0) {
      return categories;
    }

    let currentLevel = categories;
    for (const slug of selectedPath) {
      const found = currentLevel.find((c) => c.slug === slug);
      if (found?.children) {
        currentLevel = found.children;
      }
    }
    return currentLevel;
  };

  const getMascotPath = (mascot: string) => `/Mascots/${mascot}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <motion.div
          className="h-full bg-black"
          initial={{ width: "0%" }}
          animate={{
            width:
              step.type === "agent_selection"
                ? "25%"
                : step.type === "category_tree"
                  ? "50%"
                  : step.type === "questions"
                    ? "75%"
                    : "100%",
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Agent Selection */}
          {step.type === "agent_selection" && (
            <motion.div
              key="agent_selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">Välj din Agent</h1>
              <p className="text-xl text-gray-600 mb-12">
                Vilken typ av assistent behöver du?
              </p>

              {loading ? (
                <div className="flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {agentTypes.map((agent) => (
                    <motion.button
                      key={agent.id}
                      onClick={() => handleSelectAgent(agent)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all"
                    >
                      <div
                        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                        style={{ backgroundColor: agent.color }}
                      />

                      <div className="relative z-10">
                        {/* Mascot Image */}
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <Image
                            src={getMascotPath(agent.mascot)}
                            alt={agent.name}
                            fill
                            className="object-contain"
                          />
                        </div>

                        <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                        <p className="text-sm text-gray-600">
                          {agent.description}
                        </p>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                            style={{ backgroundColor: agent.color }}
                          >
                            {agent.onboardingPrompt.substring(0, 20)}...
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {error && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Category Tree Navigation */}
          {step.type === "category_tree" && selectedAgent && (
            <motion.div
              key="category_tree"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid md:grid-cols-3 gap-8">
                {/* Sidebar - Agent + Path */}
                <div className="md:col-span-1">
                  <div className="sticky top-4">
                    {/* Agent Info */}
                    <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <Image
                          src={getMascotPath(selectedAgent.mascot)}
                          alt={selectedAgent.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h2 className="text-lg font-bold text-center">
                        {selectedAgent.name}
                      </h2>
                      <p className="text-sm text-gray-600 text-center mt-2">
                        {selectedAgent.onboardingPrompt}
                      </p>
                    </div>

                    {/* Current Path */}
                    {selectedPath.length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-4 text-sm">
                        <p className="font-semibold mb-2">Din väg:</p>
                        <div className="space-y-1">
                          {selectedPath.map((slug, i) => (
                            <div key={i} className="text-gray-700 pl-2">
                              {i > 0 && "→ "}
                              {slug}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Content - Categories */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-xl p-8 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">
                        {selectedPath.length === 0
                          ? "Huvudkategorier"
                          : selectedCategory?.name}
                      </h2>
                      {selectedPath.length > 0 && (
                        <button
                          onClick={handleBack}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Tillbaka
                        </button>
                      )}
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getCurrentLevelCategories().map((category) => (
                          <motion.button
                            key={category.id}
                            onClick={() => handleSelectCategory(category)}
                            whileHover={{ x: 4 }}
                            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-black hover:bg-gray-50 transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {category.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {category.description}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black ml-4 flex-shrink-0" />
                            </div>

                            {/* Show child count or use case count */}
                            {category.children && category.children.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                {category.children.length} underkategorier
                              </div>
                            )}
                            {category.useCases && category.useCases.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                {category.useCases.length} use cases
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Context Questions */}
          {step.type === "questions" && selectedCategory && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors mb-6"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Tillbaka
                </button>

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  {/* Mascot Greeting */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={getMascotPath(selectedAgent!.mascot)}
                        alt={selectedAgent!.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        {selectedAgent!.name}
                      </p>
                      <p className="text-gray-700">
                        Bra val! Låt mig ställa några frågor för att förstå
                        dina behov bättre.
                      </p>
                    </div>
                  </div>

                  {/* Context Questions */}
                  <div className="space-y-6 mb-8">
                    {selectedCategory.contextQuestions &&
                      selectedCategory.contextQuestions.map(
                        (question, idx) => (
                          <div key={idx}>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              {question}
                            </label>
                            <textarea
                              value={responses[question] || ""}
                              onChange={(e) =>
                                handleResponseChange(question, e.target.value)
                              }
                              placeholder="Skriv ditt svar här..."
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                              rows={3}
                            />
                          </div>
                        )
                      )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleBack}
                      className="flex-1 px-6 py-3 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Tillbaka
                    </button>
                    <motion.button
                      onClick={handleComplete}
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex-1 px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Skapar agent...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Slutför
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
