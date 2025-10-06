"use client";

import { useState } from "react";
import { X, Mail, Sparkles } from "lucide-react";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  profession: string;
  solutions: { task: string; solution: string; prompt: string }[];
}

export default function EmailCaptureModal({
  isOpen,
  onClose,
  profession,
  solutions,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !consent) {
      setError("Du måste fylla i email och godkänna villkoren");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Here you would normally send the email
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSent(true);
    } catch (err) {
      setError("Något gick fel. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!sent ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Få alla AI-prompts via email
              </h2>
              <p className="text-gray-600">
                Vi skickar 10-15 skräddarsydda prompts för {profession} + en implementationsguide
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Din email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="din@email.se"
                  required
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="consent" className="text-sm text-gray-600">
                  Jag godkänner att min email används för att skicka AI-prompts och tips (max 1 mail/vecka)
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Skickar...
                  </span>
                ) : (
                  "Skicka prompts"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kolla din inbox! 📧
            </h2>
            <p className="text-gray-600 mb-6">
              Vi har skickat alla prompts till {email}
            </p>
            <button
              onClick={onClose}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Stäng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
