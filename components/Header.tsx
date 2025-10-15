"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="font-bold text-xl tracking-tight">
            MENDIO
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/business/bot-builder"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Build bot
            </a>
            <a
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/contact"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Contact
            </a>
            <LanguageSwitcher />
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-black transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 border-t border-gray-200"
          >
            <div className="flex flex-col space-y-4">
              <a
                href="/business/bot-builder"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Build bot
              </a>
              <a
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/contact"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Contact
              </a>
              <div className="pt-2 border-t border-gray-100">
                <LanguageSwitcher />
              </div>
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
}