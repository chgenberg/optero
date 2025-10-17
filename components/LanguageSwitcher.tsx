"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Determine current language from pathname
  const isSwedish = pathname?.startsWith('/sv') || false;
  const currentLang = isSwedish ? 'sv' : 'en';
  
  const languages = [
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'sv', name: 'SV', flag: '🇸🇪' }
  ];
  
  const switchLanguage = (langCode: string) => {
    if (!pathname) return;
    
    let newPath = pathname;
    
    if (langCode === 'sv' && !isSwedish) {
      // Switch to Swedish
      newPath = '/sv' + pathname;
    } else if (langCode === 'en' && isSwedish) {
      // Switch to English
      newPath = pathname.replace(/^\/sv/, '');
      if (!newPath) newPath = '/';
    }
    
    try { localStorage.setItem('preferredLang', langCode); } catch {}
    router.push(newPath);
    setIsOpen(false);
  };
  
  const currentLanguage = languages.find(lang => lang.code === currentLang);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline">{currentLanguage?.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
            >
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                    lang.code === currentLang ? 'bg-gray-50 font-medium' : ''
                  } ${
                    lang.code === languages[0].code ? 'rounded-t-xl' : ''
                  } ${
                    lang.code === languages[languages.length - 1].code ? 'rounded-b-xl' : ''
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name === 'EN' ? 'English' : 'Svenska'}</span>
                  {lang.code === currentLang && (
                    <svg className="w-4 h-4 ml-auto text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}