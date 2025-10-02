"use client";

import { useState, useEffect } from "react";
import professionsData from "@/data/professions.json";

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
  const [tasks, setTasks] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<{task: string, priority: number}[]>([]);
  const [loading, setLoading] = useState(false);

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

  const updatePriority = (task: string, priority: number) => {
    setSelectedTasks((prev) =>
      prev.map((t) => (t.task === task ? { ...t, priority } : t))
    );
  };

  const isSelected = (task: string) => {
    return selectedTasks.some((t) => t.task === task);
  };

  const getPriority = (task: string) => {
    return selectedTasks.find((t) => t.task === task)?.priority || 3;
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
          ← Tillbaka
        </button>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-2 sm:mb-3">
          Vilka arbetsuppgifter har du?
        </h2>
        <p className="text-center text-gray-500 mb-6 lg:mb-8 font-light text-sm sm:text-base">
          Välj uppgifter och ange hur mycket tid de tar
        </p>

        {loading ? (
          <div className="w-full flex items-center justify-center py-8 sm:py-12">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
          </div>
        ) : (
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
              
              {isSelected(task) && (
                <div className="pl-7 sm:pl-8 pr-2 sm:pr-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-xs sm:text-sm text-gray-600 sm:min-w-[120px]">Hur mycket tid:</span>
                    <div className="flex gap-1 sm:gap-2 flex-1">
                      {[
                        { value: 1, label: "Lite" },
                        { value: 3, label: "Medel" },
                        { value: 5, label: "Mycket" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updatePriority(task, option.value);
                          }}
                          className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all ${
                            getPriority(task) === option.value
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={selectedTasks.length === 0}
          className="w-full py-3 sm:py-4 text-sm sm:text-base bg-gray-800 text-white rounded-xl lg:rounded-2xl hover:bg-gray-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Få AI-rekommendationer ({selectedTasks.length} uppgifter valda)
        </button>
      </div>
    </div>
  );
}

