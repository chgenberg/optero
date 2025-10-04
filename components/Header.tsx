"use client";

import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Mobile menu overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setShowMenu(false)}>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <button
                onClick={() => setShowMenu(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <nav className="mt-12 space-y-6">
                <a 
                  href="/" 
                  className="block text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  Hitta AI-verktyg
                </a>
                <a 
                  href="/prompts" 
                  className="block text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  Prompt-bibliotek
                </a>
                <a 
                  href="/premium/interview" 
                  className="block text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  Premium
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2 group">
              <img 
                src="/optero_logo.png" 
                alt="Optero" 
                className="h-7 w-auto transition-transform group-hover:scale-105" 
              />
            </a>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Hitta AI-verktyg
              </a>
              <a href="/prompts" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Prompt-bibliotek
              </a>
              <a href="/premium/interview" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Premium
              </a>
            </nav>

            <button 
              onClick={() => setShowMenu(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
