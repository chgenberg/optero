"use client";

import { useState } from "react";
import { Mail, Check, X } from "lucide-react";

interface SaveResultsPromptProps {
  profession: string;
  specialization: string;
  onSave?: (email: string) => void;
}

export default function SaveResultsPrompt({
  profession,
  specialization,
  onSave,
}: SaveResultsPromptProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleSave = async () => {
    if (!email || !email.includes("@")) return;

    setIsSaving(true);

    try {
      // Save to database and send magic link
      const response = await fetch("/api/magic-link/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          profession,
          specialization,
        }),
      });

      if (response.ok) {
        setIsSaved(true);
        onSave?.(email);
        
        // Auto-collapse after 3 seconds
        setTimeout(() => {
          setIsExpanded(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to save results:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm animate-fade-in-up">
      {!isExpanded ? (
        // Collapsed state - subtle button
        <button
          onClick={() => setIsExpanded(true)}
          className="group bg-white rounded-full shadow-lg border border-gray-200 px-6 py-3 flex items-center gap-3 hover:shadow-xl transition-all hover:scale-105"
        >
          <Mail className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            Spara ditt resultat
          </span>
        </button>
      ) : (
        // Expanded state - email input
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 relative">
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>

          {!isSaved ? (
            <>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Spara ditt resultat
                  </h3>
                  <p className="text-sm text-gray-600">
                    Få en länk via email så du kan komma tillbaka när som helst
                  </p>
                </div>
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.se"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />

              <button
                onClick={handleSave}
                disabled={!email || isSaving}
                className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Skickar..." : "Skicka länk"}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Vi skickar endast en länk till ditt resultat. Inga spam-mejl.
              </p>
            </>
          ) : (
            // Success state
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Länk skickad!
              </h3>
              <p className="text-sm text-gray-600">
                Kolla din inbox på <span className="font-medium">{email}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
