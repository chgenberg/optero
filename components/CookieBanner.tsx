"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Show banner after a short delay
      setTimeout(() => {
        setShowBanner(true);
        setIsAnimating(true);
      }, 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const rejectCookies = () => {
    localStorage.setItem("cookieConsent", "rejected");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-3">
              Vi använder cookies för att förbättra din upplevelse, analysera användning och komma ihåg dina preferenser. 
              <Link href="/integritetspolicy" className="text-gray-900 underline hover:no-underline ml-1">
                Läs mer om cookies
              </Link>
            </p>
            <div className="flex gap-2">
              <button
                onClick={acceptCookies}
                className="text-xs bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                Acceptera alla
              </button>
              <button
                onClick={rejectCookies}
                className="text-xs text-gray-600 hover:text-gray-900 px-3 py-2 underline"
              >
                Endast nödvändiga
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
