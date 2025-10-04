"use client";

import { useState } from "react";
import Link from "next/link";

interface EmailCaptureProps {
  onSubmit: (email: string, consent: boolean) => void;
  profession: string;
  specialization: string;
}

export default function EmailCapture({ onSubmit, profession, specialization }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Vänligen ange din e-postadress");
      return;
    }

    if (!validateEmail(email)) {
      setError("Vänligen ange en giltig e-postadress");
      return;
    }

    if (!consent) {
      setError("Du måste godkänna integritetspolicyn för att fortsätta");
      return;
    }

    onSubmit(email, consent);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card p-8 sm:p-10 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Nästan klart!
            </h2>
            <p className="text-gray-600">
              Vi förbereder dina personliga AI-rekommendationer för <span className="font-medium text-gray-900">{specialization || profession}</span>
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Analyserar...</span>
              <span className="text-xs text-gray-500">90% klart</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gray-900 h-2 rounded-full animate-pulse" style={{ width: '90%' }}></div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Din e-postadress
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all"
                placeholder="namn@foretag.se"
                autoComplete="email"
              />
              <p className="text-xs text-gray-500 mt-2">
                Vi skickar dina resultat hit och håller dig uppdaterad om nya AI-verktyg för ditt yrke
              </p>
            </div>

            {/* Consent checkbox */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  Jag godkänner att Optero sparar mina uppgifter enligt{" "}
                  <Link href="/integritetspolicy" target="_blank" className="underline hover:no-underline">
                    integritetspolicyn
                  </Link>
                  . Vi använder din data för att förbättra tjänsten och skicka relevanta uppdateringar. 
                  Du kan när som helst avregistrera dig.
                </span>
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full btn-primary py-4 text-lg font-medium"
            >
              Visa mina AI-rekommendationer
            </button>
          </form>

          {/* Trust indicators */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Säker anslutning</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>GDPR-kompatibel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
