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
          <div className="grid grid-cols-3 items-center h-16">
            {/* Left placeholder to allow true centering */}
            <div className="hidden sm:block" />

            {/* Centered logo */}
            <div className="flex justify-center">
              <a href="/" className="inline-flex items-center group">
                <img
                  src="/MENDIO_logo.png"
                  alt="MENDIO"
                  className="h-10 sm:h-12 md:h-14 w-auto transition-transform group-hover:scale-105"
                />
              </a>
            </div>

            {/* Right actions */}
            <div className="flex items-center justify-end gap-2 sm:gap-4">
              <a
                href="/dashboard"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap"
              >
                Mina bots
              </a>
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
