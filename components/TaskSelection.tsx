"use client";

import { useState, useEffect } from "react";
import professionsData from "@/data/professions.json";
import { useLanguage } from "@/contexts/LanguageContext";

interface TaskSelectionProps {
  profession: string;
  specialization: string;
  onSubmit: (tasks: {task: string, priority: number}[]) => void;
  onBack: () => void;
}

// Fallback tasks om inget finns i JSON
const TASKS: Record<string, string[]> = {
  "Ambulanssjuksköterska": [
    "Akut bedömning av patienters tillstånd",
    "Administrera läkemedel och behandlingar på plats",
    "Kommunikation med sjukhus och läkare",
    "Dokumentation av patientjournaler",
    "Hantering av medicinsk utrustning",
    "Traumavård och stabilisering",
    "Kommunikation med anhöriga",
  ],
  "Akutsjuksköterska": [
    "Triage och prioritering av patienter",
    "Administrera akut vård och behandlingar",
    "Dokumentation i journalsystem",
    "Samarbete med läkare och annan vårdpersonal",
    "Hantering av medicinsk utrustning",
    "Patientinformation och kommunikation",
    "Övervakning av vitala parametrar",
  ],
  "default": [
    "Planering och organisation",
    "Dokumentation och rapportering",
    "Kommunikation med klienter/patienter/kunder",
    "Samarbete med kollegor",
    "Analyser och bedömningar",
    "Administrativt arbete",
    "Uppföljning och utvärdering",
  ],
};

export default function TaskSelection({
  profession,
  specialization,
  onSubmit,
  onBack,
}: TaskSelectionProps) {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<{task: string, priority: number}[]>([]);
  const [loading, setLoading] = useState(false);
  const [customTasks, setCustomTasks] = useState<string[]>([]);
  const [customTaskInput, setCustomTaskInput] = useState("");

  useEffect(() => {
    // Hämta uppgifter från API med GPT-4o-mini
    setLoading(true);
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profession, specialization }),
    })
      .then((r) => r.json())
      .then((data) => {
        const items: string[] = Array.isArray(data?.tasks) && data.tasks.length > 0
          ? data.tasks
          : TASKS.default;
        setTasks(items);
      })
      .catch(() => setTasks(TASKS.default))
      .finally(() => setLoading(false));
  }, [specialization, profession]);

  const toggleTask = (task: string) => {
    setSelectedTasks((prev) => {
      const exists = prev.find((t) => t.task === task);
      if (exists) {
        return prev.filter((t) => t.task !== task);
      } else {
        return [...prev, { task, priority: 3 }]; // Default priority medium
      }
    });
  };

  const isSelected = (task: string) => {
    return selectedTasks.some((t) => t.task === task);
  };

  const addCustomTask = () => {
    if (customTaskInput.trim()) {
      setCustomTasks([...customTasks, customTaskInput.trim()]);
      setCustomTaskInput("");
    }
  };

  const removeCustomTask = (taskToRemove: string) => {
    setCustomTasks(customTasks.filter(t => t !== taskToRemove));
    setSelectedTasks(selectedTasks.filter(t => t.task !== taskToRemove));
  };

  const handleSubmit = () => {
    if (selectedTasks.length > 0) {
      onSubmit(selectedTasks);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up px-4">
      <div className="relative bg-white rounded-2xl lg:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 border border-gray-100 overflow-hidden">
        <div className="absolute inset-0 gradient-radial pointer-events-none" />
        <button
          onClick={onBack}
          className="mb-4 sm:mb-6 text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          ← {t('buttons.back')}
        </button>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-2 sm:mb-3">
          {t('tasks.title')}
        </h2>
        <p className="text-center text-gray-500 mb-6 lg:mb-8 font-light text-sm sm:text-base">
          {t('tasks.subtitle')}
        </p>

        {loading ? (
          <div className="w-full flex items-center justify-center py-8 sm:py-12">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2">
              {tasks.map((task, index) => (
                <div key={index} className="space-y-2">
                  <button
                    onClick={() => toggleTask(task)}
                    className={`w-full p-3 sm:p-4 rounded-xl lg:rounded-2xl text-left transition-colors duration-200 border-2 text-sm sm:text-base ${
                      isSelected(task)
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected(task)
                            ? "bg-white border-white"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected(task) && (
                          <span className="text-gray-800 text-xs sm:text-sm">✓</span>
                        )}
                      </div>
                      <span
                        className={`flex-1 transition-none ${
                          isSelected(task) ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {task}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
              
              {/* Custom tasks */}
              {customTasks.map((task, index) => (
                <div key={`custom-${index}`} className="space-y-2">
                  <button
                    onClick={() => toggleTask(task)}
                    className={`w-full p-3 sm:p-4 rounded-xl lg:rounded-2xl text-left transition-colors duration-200 border-2 text-sm sm:text-base ${
                      isSelected(task)
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected(task)
                            ? "bg-white border-white"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected(task) && (
                          <span className="text-gray-800 text-xs sm:text-sm">✓</span>
                        )}
                      </div>
                      <span
                        className={`flex-1 transition-none ${
                          isSelected(task) ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {task}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomTask(task);
                        }}
                        className={`ml-2 p-1 rounded hover:bg-gray-200 transition-colors ${
                          isSelected(task) ? "text-white hover:bg-gray-700" : "text-gray-400"
                        }`}
                      >
                        ×
                      </button>
                    </div>
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add custom task section */}
            <div className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Lägg till egna arbetsuppgifter
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTaskInput}
                  onChange={(e) => setCustomTaskInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTask();
                    }
                  }}
                  placeholder="Beskriv din arbetsuppgift..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none transition-all text-sm sm:text-base"
                />
                <button
                  onClick={addCustomTask}
                  disabled={!customTaskInput.trim()}
                  className="px-4 sm:px-5 py-2 sm:py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {customTasks.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {customTasks.length} egen{customTasks.length !== 1 ? 'a' : ''} uppgift{customTasks.length !== 1 ? 'er' : ''} tillagd{customTasks.length !== 1 ? 'a' : ''}
                </p>
              )}
            </div>
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={selectedTasks.length === 0}
          className="w-full py-3 sm:py-4 text-sm sm:text-base bg-gray-800 text-white rounded-xl lg:rounded-2xl hover:bg-gray-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('tasks.button')} ({t('tasks.selected', { count: selectedTasks.length.toString() })})
        </button>
      </div>
    </div>
  );
}

