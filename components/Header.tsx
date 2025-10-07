"use client";

import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import LoginModal from "./LoginModal";

export default function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2 group">
              <img 
                src="/MENDIO_logo_with_slogan.png" 
                alt="MENDIO - AI som ger dig tiden tillbaka" 
                className="h-10 w-auto transition-transform group-hover:scale-105"
              />
            </a>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap"
              >
                Se tidigare resultat
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}
