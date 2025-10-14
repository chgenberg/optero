"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="font-bold text-xl tracking-tight">
            MENDIO
          </a>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <a
              href="/business/bot-builder"
              className="text-sm font-medium text-[#4B5563] hover:text-black transition-colors"
            >
              Bygg bot
            </a>
            <a
              href="/dashboard"
              className="text-sm font-medium text-[#4B5563] hover:text-black transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/kontakt"
              className="text-sm font-medium text-[#4B5563] hover:text-black transition-colors"
            >
              Kontakt
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
