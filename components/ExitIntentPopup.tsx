"use client";

import { useState, useEffect } from "react";

interface ExitIntentPopupProps {
  profession: string;
  specialization: string;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function ExitIntentPopup({ 
  profession, 
  specialization, 
  onClose, 
  onUpgrade 
}: ExitIntentPopupProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let hasShown = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        hasShown = true;
        setIsVisible(true);
      }
    };

    // Add exit intent listener
    document.addEventListener("mouseleave", handleMouseLeave);

    // Start countdown when popup shows
    if (isVisible) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        document.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4 animate-scale-up">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with urgency */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 text-center">
            <div className="animate-pulse-scale mb-2">
              <span className="text-6xl">⏰</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">VÄNTA! Specialerbjudande bara för dig</h2>
            <p className="text-lg">
              Giltigt endast de nästa <span className="font-mono font-bold bg-white/20 px-2 py-1 rounded">{formatTime(timeLeft)}</span>
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-lg text-gray-700 mb-4">
                Som {specialization || profession} kan du spara <strong>minst 8 timmar per vecka</strong> med rätt AI-verktyg.
              </p>
              
              {/* Special offer */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <p className="text-3xl font-bold text-green-600 mb-1">
                  30% RABATT
                </p>
                <p className="text-lg">
                  <span className="line-through text-gray-500">10€</span>
                  <span className="text-3xl font-bold text-gray-900 ml-2">7€</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  + BONUS: Gratis 1-månads email-support (värd 50€)
                </p>
              </div>

              {/* Benefits reminder */}
              <div className="text-left space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">15+ AI-verktyg (istället för bara 3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Personlig PDF-guide att ladda ner</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">4-veckors implementeringsplan</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg animate-pulse-scale"
              >
                Ja, ge mig 30% rabatt! 🎉
              </button>
              
              <button
                onClick={onClose}
                className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                Nej tack, jag vill inte spara tid
              </button>
            </div>

            {/* Trust indicator */}
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>🔒 Säker betalning · 💚 Nöjd-garanti · ⚡ Direkt tillgång</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
