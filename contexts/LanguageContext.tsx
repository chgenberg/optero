"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, getTranslations, getNestedTranslation } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en'); // Default to English
  const [translations, setTranslations] = useState(getTranslations('en'));

  // Load saved language from localStorage or detect from URL
  useEffect(() => {
    // Check URL path for language
    const path = window.location.pathname;
    const urlLang = path.split('/')[1] as Locale;
    
    if (['sv', 'es', 'fr', 'de'].includes(urlLang)) {
      setLocaleState(urlLang);
      setTranslations(getTranslations(urlLang));
      localStorage.setItem('mendio-language', urlLang);
      return;
    }
    
    // Check localStorage
    const saved = localStorage.getItem('mendio-language') as Locale;
    if (saved && ['sv', 'en', 'es', 'fr', 'de'].includes(saved)) {
      setLocaleState(saved);
      setTranslations(getTranslations(saved));
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (['sv', 'es', 'fr', 'de'].includes(browserLang)) {
        setLocaleState(browserLang);
        setTranslations(getTranslations(browserLang));
      }
      // Otherwise stay with English default
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setTranslations(getTranslations(newLocale));
    localStorage.setItem('mendio-language', newLocale);
    
    // Update HTML lang attribute
    document.documentElement.lang = newLocale;
  };

  const t = (key: string, params?: Record<string, string>) => {
    return getNestedTranslation(translations, key, params);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
