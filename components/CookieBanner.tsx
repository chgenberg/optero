"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 transition-transform duration-300 ${
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
            {/* Cookie icon and text */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
                  <span className="text-2xl">🍪</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Vi använder cookies</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    För att ge dig bästa möjliga upplevelse använder vi cookies. 
                    Dessa hjälper oss att förstå hur du använder tjänsten så att vi kan göra den ännu bättre. 
                    Vi respekterar din integritet och delar aldrig dina uppgifter med tredje part för marknadsföring.
                  </p>
                  <Link 
                    href="/integritetspolicy" 
                    className="text-sm text-gray-900 underline mt-2 inline-block hover:no-underline"
                  >
                    Läs mer i vår integritetspolicy
                  </Link>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <button
                onClick={acceptCookies}
                className="btn-primary px-6 py-3 text-sm font-medium whitespace-nowrap"
              >
                Acceptera alla
              </button>
              <button
                onClick={rejectCookies}
                className="btn-secondary px-6 py-3 text-sm font-medium whitespace-nowrap"
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
